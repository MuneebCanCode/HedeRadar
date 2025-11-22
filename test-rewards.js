// Test script to trigger MLAT processing and rewards
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testRewards() {
  console.log('🧪 Testing Hedera Reward System...\n');

  try {
    // 1. Check Hedera status
    console.log('1️⃣  Checking Hedera status...');
    const hederaRes = await axios.get(`${API_URL}/hedera/topic`);
    console.log(`   ✅ Hedera: ${hederaRes.data.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   📋 Topic ID: ${hederaRes.data.topicId}`);
    console.log(`   🔗 Explorer: ${hederaRes.data.explorerUrl}\n`);

    // 2. Get receivers
    console.log('2️⃣  Getting receivers...');
    const receiversRes = await axios.get(`${API_URL}/receivers`);
    console.log(`   📡 Found ${receiversRes.data.length} receivers\n`);

    // 3. Generate mock MLAT messages
    console.log('3️⃣  Generating MLAT messages...');
    const messages = [];
    const aircraftIds = ['TEST001', 'TEST002', 'TEST003'];
    const baseTime = Date.now();

    aircraftIds.forEach((aircraftId, idx) => {
      const baseLat = 40.73 + idx * 0.02;
      const baseLon = -73.98 + idx * 0.02;
      const baseAlt = 3000 + idx * 500;

      receiversRes.data.forEach((receiver) => {
        const distance = Math.sqrt(
          Math.pow((baseLat - receiver.lat) * 111000, 2) +
          Math.pow((baseLon - receiver.lon) * 111000, 2) +
          Math.pow(baseAlt - receiver.alt, 2)
        );
        const timeDelay = (distance / 299792458) * 1000;

        messages.push({
          aircraftId,
          receiverId: receiver.id,
          timestamp: baseTime + timeDelay + Math.random() * 10,
          signal: 85 + Math.random() * 10,
          altitude: baseAlt,
          speed: 450 + idx * 10
        });
      });
    });

    console.log(`   ✅ Generated ${messages.length} messages for ${aircraftIds.length} aircraft\n`);

    // 4. Process MLAT
    console.log('4️⃣  Processing MLAT calculations...');
    const processRes = await axios.post(`${API_URL}/process`, { messages });
    console.log(`   ✅ Processed ${processRes.data.processed} positions\n`);

    // Wait a moment for rewards to be calculated
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Check reward stats
    console.log('5️⃣  Checking reward statistics...');
    const statsRes = await axios.get(`${API_URL}/rewards/stats`);
    console.log(`   💰 Total Rewards Distributed: ${statsRes.data.totalRewardsDistributed} HBAR`);
    console.log(`   📊 Total Transactions: ${statsRes.data.totalTransactions}`);
    console.log(`   📡 Receivers Rewarded: ${statsRes.data.receivers.length}\n`);

    if (statsRes.data.receivers.length > 0) {
      console.log('   Top Receivers:');
      statsRes.data.receivers.slice(0, 5).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.receiverId}: ${r.total.toFixed(6)} HBAR (${r.count} contributions, ${r.averageQuality}% avg quality)`);
      });
      console.log('');
    }

    // 6. Check reward history
    console.log('6️⃣  Checking reward history...');
    const historyRes = await axios.get(`${API_URL}/rewards/history?limit=10`);
    console.log(`   📜 Recent Rewards: ${historyRes.data.total} total\n`);

    if (historyRes.data.rewards.length > 0) {
      console.log('   Latest Rewards:');
      historyRes.data.rewards.slice(0, 5).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.receiverId}: ${r.reward.toFixed(6)} HBAR (Quality: ${r.quality}%, Status: ${r.status})`);
      });
      console.log('');
    }

    // 7. Check leaderboard
    console.log('7️⃣  Checking leaderboard...');
    const leaderboardRes = await axios.get(`${API_URL}/rewards/leaderboard`);
    console.log(`   🏆 Top ${leaderboardRes.data.leaderboard.length} Receivers:\n`);
    
    leaderboardRes.data.leaderboard.forEach((entry, i) => {
      console.log(`   ${i + 1}. ${entry.receiver?.name || entry.receiverId}`);
      console.log(`      💰 Total: ${entry.total.toFixed(6)} HBAR`);
      console.log(`      📊 Contributions: ${entry.count}`);
      console.log(`      ⭐ Avg Quality: ${entry.averageQuality}%`);
      console.log(`      🎁 Last Reward: ${entry.lastReward?.toFixed(6)} HBAR`);
      console.log('');
    });

    console.log('✅ Test completed successfully!');
    console.log(`\n🔗 View HCS messages: ${hederaRes.data.explorerUrl}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

testRewards();
