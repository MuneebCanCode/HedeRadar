// Hedera Integration Service
import {
  Client,
  AccountId,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  TransferTransaction,
  Hbar
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory (project root)
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

class HederaService {
  constructor() {
    this.client = null;
    this.topicId = null;
    this.rewardTokenId = process.env.REWARD_TOKEN_ID;
    this.operatorId = null;
    this.operatorKey = null;
  }

  async initialize() {
    try {
      // Check if credentials are provided
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        console.log('ℹ️  Hedera credentials not configured - running in DEMO MODE');
        console.log('   All MLAT features work normally without blockchain integration');
        return false;
      }

      this.operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
      
      // Try to parse the private key - handle different formats
      const keyString = process.env.HEDERA_PRIVATE_KEY;
      try {
        // Try ED25519 format first (most common for Hedera)
        this.operatorKey = PrivateKey.fromStringED25519(keyString);
      } catch (e1) {
        try {
          // Try ECDSA format
          this.operatorKey = PrivateKey.fromStringECDSA(keyString);
        } catch (e2) {
          // Fall back to generic parsing
          this.operatorKey = PrivateKey.fromString(keyString);
        }
      }
      
      this.client = Client.forTestnet();
      this.client.setOperator(this.operatorId, this.operatorKey);
      
      console.log('✅ Hedera client initialized');
      return true;
    } catch (error) {
      console.error('❌ Hedera initialization failed:', error.message);
      console.log('   Continuing in DEMO MODE - all features work without blockchain');
      return false;
    }
  }

  async getOrCreateTopic() {
    try {
      // Check if topic ID exists in environment
      if (process.env.HEDERA_TOPIC_ID) {
        try {
          this.topicId = TopicId.fromString(process.env.HEDERA_TOPIC_ID);
          console.log(`✅ Using existing topic: ${this.topicId}`);
          return this.topicId.toString();
        } catch (error) {
          console.log('⚠️  Invalid topic ID in .env, creating new topic...');
        }
      }

      // Create new topic if none exists
      const transaction = new TopicCreateTransaction()
        .setTopicMemo('HedeRadar MLAT Tracking Log');
      
      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      this.topicId = receipt.topicId;
      const topicIdString = this.topicId.toString();
      console.log(`✅ New topic created: ${topicIdString}`);
      
      // Save topic ID to .env file
      this.saveTopicIdToEnv(topicIdString);
      
      return topicIdString;
    } catch (error) {
      console.error('❌ Topic creation failed:', error.message);
      console.log('   Note: This may be due to invalid credentials or insufficient HBAR balance');
      console.log('   Continuing without HCS logging - positions will be tracked locally');
      return null;
    }
  }

  saveTopicIdToEnv(topicId) {
    try {
      const envPath = join(__dirname, '..', '.env');
      let envContent = readFileSync(envPath, 'utf-8');
      
      // Check if HEDERA_TOPIC_ID already exists
      if (envContent.includes('HEDERA_TOPIC_ID=')) {
        // Update existing line
        envContent = envContent.replace(
          /HEDERA_TOPIC_ID=.*/,
          `HEDERA_TOPIC_ID=${topicId}`
        );
      } else {
        // Add new line after HEDERA_NETWORK
        envContent = envContent.replace(
          /(HEDERA_NETWORK=.*)/,
          `$1\nHEDERA_TOPIC_ID=${topicId}`
        );
      }
      
      writeFileSync(envPath, envContent, 'utf-8');
      console.log(`💾 Topic ID saved to .env file`);
    } catch (error) {
      console.error('⚠️  Could not save topic ID to .env:', error.message);
      console.log(`   Please manually add this line to your .env file:`);
      console.log(`   HEDERA_TOPIC_ID=${topicId}`);
    }
  }

  async logPosition(aircraftId, position, receivers) {
    if (!this.client || !this.topicId) {
      console.log('⚠️  Hedera not initialized, skipping log');
      return null;
    }

    try {
      const message = JSON.stringify({
        type: 'MLAT_POSITION',
        timestamp: Date.now(),
        aircraftId,
        position: {
          lat: position.lat,
          lon: position.lon,
          alt: position.alt,
          quality: position.quality
        },
        receivers: receivers.map(r => r.id),
        numReceivers: receivers.length
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`✅ Position logged to HCS: ${aircraftId} (Seq: ${receipt.topicSequenceNumber})`);
      return {
        status: receipt.status.toString(),
        sequenceNumber: receipt.topicSequenceNumber.toString()
      };
    } catch (error) {
      console.error('❌ HCS logging failed:', error.message);
      return null;
    }
  }

  async logAlert(alert) {
    if (!this.client || !this.topicId) {
      return null;
    }

    try {
      const message = JSON.stringify({
        type: 'ALERT',
        timestamp: Date.now(),
        alertType: alert.type,
        severity: alert.severity,
        aircraftId: alert.aircraftId,
        details: {
          message: alert.message,
          position: alert.aircraftPosition || alert.position1,
          additionalData: {
            aircraft2: alert.aircraft2,
            distance: alert.distance,
            runway: alert.runway,
            zone: alert.zone,
            deviation: alert.deviation
          }
        }
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`🚨 Alert logged to HCS: ${alert.type} for ${alert.aircraftId} (Seq: ${receipt.topicSequenceNumber})`);
      return {
        status: receipt.status.toString(),
        sequenceNumber: receipt.topicSequenceNumber.toString()
      };
    } catch (error) {
      console.error('❌ Alert logging failed:', error.message);
      return null;
    }
  }

  async logReward(receiverId, amount, aircraftId, quality) {
    if (!this.client || !this.topicId) {
      return null;
    }

    try {
      const message = JSON.stringify({
        type: 'RECEIVER_REWARD',
        timestamp: Date.now(),
        receiverId,
        amount,
        aircraftId,
        quality,
        currency: 'HBAR'
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`💰 Reward logged to HCS: ${receiverId} received ${amount} HBAR (Seq: ${receipt.topicSequenceNumber})`);
      return {
        status: receipt.status.toString(),
        sequenceNumber: receipt.topicSequenceNumber.toString()
      };
    } catch (error) {
      console.error('❌ Reward logging failed:', error.message);
      return null;
    }
  }

  async logSystemEvent(eventType, data) {
    if (!this.client || !this.topicId) {
      return null;
    }

    try {
      const message = JSON.stringify({
        type: 'SYSTEM_EVENT',
        timestamp: Date.now(),
        eventType,
        data
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`📋 System event logged to HCS: ${eventType} (Seq: ${receipt.topicSequenceNumber})`);
      return {
        status: receipt.status.toString(),
        sequenceNumber: receipt.topicSequenceNumber.toString()
      };
    } catch (error) {
      console.error('❌ System event logging failed:', error.message);
      return null;
    }
  }

  /**
   * Calculate quality-based reward for a receiver
   * Higher quality = more rewards
   * Formula: baseReward * (quality/100) * qualityMultiplier
   */
  calculateReward(quality, baseReward = 0.001) {
    // Quality ranges from 0-100
    const normalizedQuality = Math.max(0, Math.min(100, quality)) / 100;
    
    // Apply quality multiplier (exponential curve for better rewards at high quality)
    const qualityMultiplier = 1 + (normalizedQuality * normalizedQuality);
    
    // Calculate final reward
    const reward = baseReward * normalizedQuality * qualityMultiplier;
    
    return parseFloat(reward.toFixed(6)); // Round to 6 decimals
  }

  /**
   * Reward receivers with actual HBAR transfers
   * Quality-based calculation with real-time distribution
   */
  async rewardReceivers(receivers, aircraftId, positionQuality) {
    if (!this.client) {
      console.log('⚠️  Hedera not initialized, skipping rewards');
      return [];
    }

    const results = [];
    const enableRealTransfers = process.env.ENABLE_REAL_TRANSFERS === 'true';

    for (const receiver of receivers) {
      try {
        // Calculate quality-based reward
        const quality = receiver.quality || positionQuality || 85;
        const baseReward = parseFloat(process.env.BASE_REWARD_HBAR || '0.001');
        const rewardAmount = this.calculateReward(quality, baseReward);
        
        let transactionId = null;
        let status = 'calculated';

        // Execute real HBAR transfer if enabled
        if (enableRealTransfers) {
          try {
            // Get receiver account ID (use operator as fallback for demo)
            const receiverAccountId = receiver.accountId 
              ? AccountId.fromString(receiver.accountId)
              : this.operatorId;

            const transaction = new TransferTransaction()
              .addHbarTransfer(this.operatorId, new Hbar(-rewardAmount))
              .addHbarTransfer(receiverAccountId, new Hbar(rewardAmount))
              .setTransactionMemo(`HedeRadar reward: ${receiver.id} for ${aircraftId}`);

            const txResponse = await transaction.execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);
            
            transactionId = txResponse.transactionId.toString();
            status = receipt.status.toString();

            console.log(`💰 REAL TRANSFER: ${rewardAmount} HBAR → ${receiver.id} (Quality: ${quality}%) [${transactionId}]`);
          } catch (transferError) {
            console.error(`❌ Transfer failed for ${receiver.id}:`, transferError.message);
            status = 'transfer_failed';
          }
        } else {
          console.log(`💰 SIMULATED: ${rewardAmount} HBAR → ${receiver.id} (Quality: ${quality}%)`);
          status = 'simulated';
        }

        results.push({
          receiverId: receiver.id,
          reward: rewardAmount,
          quality: quality,
          status: status,
          transactionId: transactionId,
          timestamp: Date.now(),
          aircraftId: aircraftId,
          calculationDetails: {
            baseReward: baseReward,
            qualityScore: quality,
            qualityMultiplier: 1 + ((quality/100) * (quality/100)),
            finalReward: rewardAmount
          }
        });

      } catch (error) {
        console.error(`❌ Reward calculation failed for ${receiver.id}:`, error.message);
        results.push({
          receiverId: receiver.id,
          reward: 0,
          quality: 0,
          status: 'failed',
          error: error.message,
          timestamp: Date.now()
        });
      }
    }

    return results;
  }

  /**
   * Get reward statistics for a receiver
   */
  async getReceiverRewardStats(receiverId, rewardHistory) {
    const receiverRewards = rewardHistory.filter(r => r.receiverId === receiverId);
    
    if (receiverRewards.length === 0) {
      return {
        receiverId,
        totalRewards: 0,
        rewardCount: 0,
        averageReward: 0,
        averageQuality: 0,
        lastReward: null
      };
    }

    const totalRewards = receiverRewards.reduce((sum, r) => sum + r.reward, 0);
    const averageReward = totalRewards / receiverRewards.length;
    const averageQuality = receiverRewards.reduce((sum, r) => sum + r.quality, 0) / receiverRewards.length;
    const lastReward = receiverRewards[receiverRewards.length - 1];

    return {
      receiverId,
      totalRewards: parseFloat(totalRewards.toFixed(6)),
      rewardCount: receiverRewards.length,
      averageReward: parseFloat(averageReward.toFixed(6)),
      averageQuality: Math.round(averageQuality),
      lastReward: lastReward,
      successRate: (receiverRewards.filter(r => r.status === 'SUCCESS' || r.status === 'simulated').length / receiverRewards.length * 100).toFixed(1)
    };
  }

  async getTopicMessages(limit = 10) {
    // In production, use mirror node API to fetch messages
    // For demo, return mock data
    return [];
  }

  isInitialized() {
    return this.client !== null;
  }
}

export default new HederaService();
