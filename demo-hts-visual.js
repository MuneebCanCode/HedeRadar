// Visual Demonstration of Hedera Token Service (HTS) Rewards
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function printBox(title, content) {
  const width = 70;
  const line = '═'.repeat(width);
  print(`\n╔${line}╗`, 'cyan');
  print(`║ ${title.padEnd(width - 2)} ║`, 'cyan');
  print(`╠${line}╣`, 'cyan');
  content.forEach(line => {
    print(`║ ${line.padEnd(width - 2)} ║`, 'bright');
  });
  print(`╚${line}╝`, 'cyan');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function visualDemo() {
  try {
    print('\n' + '🎬'.repeat(35), 'yellow');
    print('   HEDERA TOKEN SERVICE (HTS) - VISUAL DEMONSTRATION', 'bright');
    print('🎬'.repeat(35) + '\n', 'yellow');
    
    await sleep(1000);
    
    // Step 1: Check System Status
    printBox('STEP 1: System Status Check', [
      'Verifying Hedera integration and reward system...'
    ]);
    
    const hederaRes = await axios.get(`${API_URL}/hedera/topic`);
    const statsResBefore = await axios.get(`${API_URL}/rewards/stats`);
    
    await sleep(500);
    
    print(`\n✅ Hedera Status: ${hederaRes.data.enabled ? 'ENABLED' : 'DISABLED'}`, 'green');
    print(`📋 Topic ID: ${hederaRes.data.topicId}`, 'cyan');
    print(`🔗 Explorer: ${hederaRes.data.explorerUrl}`, 'blue');
    print(`💰 Current Total Rewards: ${statsResBefore.data.totalRewardsDistributed} HBAR`, 'yellow');
    print(`📊 Current Transactions: ${statsResBefore.data.totalTransactions}`, 'yellow');
    
    await sleep(2000);
    
    // Step 2: Get Receivers
    printBox('STEP 2: Receiver Network', [
      'Loading receiver stations...'
    ]);
    
    const receiversRes = await axios.get(`${API_URL}/receivers`);
    
    await sleep(500);
    
    print(`\n📡 Active Receivers: ${receiversRes.data.length}`, 'green');
    receiversRes.data.forEach((r, i) => {
      print(`   ${i + 1}. ${r.name} (${r.id}) - ${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}`, 'cyan');
    });
    
    await sleep(2000);
    
    // Step 3: Trigger MLAT Processing with Rewards
    printBox('STEP 3: MLAT Processing & Reward Distribution', [
      'Simulating aircraft detection and MLAT calculations...',
      'This will trigger quality-based reward distribution...'
    ]);
    
    await sleep(1000);
    
    print('\n🚀 Triggering MLAT processing...', 'yellow');
    const processRes = await axios.post(`${API_URL}/demo/mlat-with-rewards`);
    
    await sleep(1000);
    
    print(`\n✅ Processing Complete!`, 'green');
    print(`   Aircraft Processed: ${processRes.data.processed}`, 'cyan');
    print(`   Rewards Distributed: ${processRes.data.totalRewards}`, 'cyan');
    print(`   Total Amount: ${processRes.data.totalAmount.toFixed(6)} HBAR`, 'yellow');
    
    await sleep(1000);
    
    // Show individual aircraft results
    print('\n📊 Per-Aircraft Results:', 'bright');
    processRes.data.results.forEach((result, i) => {
      print(`\n   Aircraft ${i + 1}: ${result.aircraft}`, 'cyan');
      print(`   ├─ Quality Score: ${result.quality}%`, 'blue');
      print(`   ├─ Receivers Rewarded: ${result.rewardsDistributed}`, 'blue');
      print(`   └─ Total Rewards: ${result.totalRewardAmount.toFixed(6)} HBAR`, 'yellow');
    });
    
    await sleep(2000);
    
    // Step 4: Check Updated Stats
    printBox('STEP 4: Updated Reward Statistics', [
      'Fetching latest reward data...'
    ]);
    
    await sleep(500);
    
    const statsResAfter = await axios.get(`${API_URL}/rewards/stats`);
    
    print(`\n💰 Total Rewards Distributed: ${statsResAfter.data.totalRewardsDistributed.toFixed(6)} HBAR`, 'green');
    print(`📊 Total Transactions: ${statsResAfter.data.totalTransactions}`, 'green');
    print(`📡 Receivers Rewarded: ${statsResAfter.data.receivers.length}`, 'green');
    
    const increase = statsResAfter.data.totalRewardsDistributed - statsResBefore.data.totalRewardsDistributed;
    print(`\n📈 Increase: +${increase.toFixed(6)} HBAR`, 'yellow');
    
    await sleep(2000);
    
    // Step 5: Show Receiver Breakdown
    printBox('STEP 5: Receiver Reward Breakdown', [
      'Individual receiver statistics...'
    ]);
    
    await sleep(500);
    
    print('\n');
    statsResAfter.data.receivers.forEach((r, i) => {
      const receiver = receiversRes.data.find(rec => rec.id === r.receiverId);
      print(`${i + 1}. ${receiver?.name || r.receiverId}`, 'cyan');
      print(`   ├─ Total Earned: ${r.total.toFixed(6)} HBAR`, 'yellow');
      print(`   ├─ Contributions: ${r.count}`, 'blue');
      print(`   ├─ Avg Quality: ${r.averageQuality}%`, 'blue');
      print(`   └─ Last Reward: ${r.lastReward.toFixed(6)} HBAR`, 'green');
      print('');
    });
    
    await sleep(2000);
    
    // Step 6: Show Leaderboard
    printBox('STEP 6: Receiver Leaderboard', [
      'Top performing receivers...'
    ]);
    
    await sleep(500);
    
    const leaderboardRes = await axios.get(`${API_URL}/rewards/leaderboard`);
    
    print('\n🏆 TOP RECEIVERS:\n', 'yellow');
    leaderboardRes.data.leaderboard.forEach((entry, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
      print(`${medal} ${i + 1}. ${entry.receiver?.name || entry.receiverId}`, 'bright');
      print(`      💰 ${entry.total.toFixed(6)} HBAR | 📊 ${entry.count} contributions | ⭐ ${entry.averageQuality}% avg quality`, 'cyan');
    });
    
    await sleep(2000);
    
    // Step 7: Show Recent Reward History
    printBox('STEP 7: Recent Reward Transactions', [
      'Latest reward distributions...'
    ]);
    
    await sleep(500);
    
    const historyRes = await axios.get(`${API_URL}/rewards/history?limit=10`);
    
    print('\n📜 RECENT REWARDS:\n', 'yellow');
    historyRes.data.rewards.slice(0, 5).forEach((r, i) => {
      const receiver = receiversRes.data.find(rec => rec.id === r.receiverId);
      print(`${i + 1}. ${receiver?.name || r.receiverId}`, 'cyan');
      print(`   ├─ Amount: ${r.reward.toFixed(6)} HBAR`, 'yellow');
      print(`   ├─ Quality: ${r.quality}%`, 'blue');
      print(`   ├─ Aircraft: ${r.aircraftId}`, 'blue');
      print(`   ├─ Status: ${r.status}`, r.status === 'simulated' ? 'yellow' : 'green');
      print(`   └─ Time: ${new Date(r.timestamp).toLocaleTimeString()}`, 'magenta');
      print('');
    });
    
    await sleep(2000);
    
    // Step 8: Show Calculation Details
    printBox('STEP 8: Reward Calculation Formula', [
      'Understanding quality-based rewards...'
    ]);
    
    await sleep(500);
    
    print('\n📐 Formula: reward = baseReward × (quality/100) × (1 + (quality/100)²)', 'cyan');
    print('\n📊 Example Calculations:', 'bright');
    
    const examples = [
      { quality: 50, base: 0.001 },
      { quality: 75, base: 0.001 },
      { quality: 90, base: 0.001 },
      { quality: 100, base: 0.001 }
    ];
    
    examples.forEach(ex => {
      const normalizedQuality = ex.quality / 100;
      const multiplier = 1 + (normalizedQuality * normalizedQuality);
      const reward = ex.base * normalizedQuality * multiplier;
      print(`\n   Quality ${ex.quality}%:`, 'yellow');
      print(`   └─ ${ex.base} × ${normalizedQuality} × ${multiplier.toFixed(2)} = ${reward.toFixed(6)} HBAR`, 'cyan');
    });
    
    await sleep(2000);
    
    // Step 9: HCS Verification
    printBox('STEP 9: Blockchain Verification', [
      'All rewards are logged to Hedera Consensus Service...'
    ]);
    
    await sleep(500);
    
    print(`\n🔗 View on HashScan:`, 'bright');
    print(`   ${hederaRes.data.explorerUrl}`, 'blue');
    print(`\n📋 Look for messages with type: "RECEIVER_REWARD"`, 'cyan');
    print(`💡 All transactions are immutable and publicly verifiable`, 'green');
    
    await sleep(2000);
    
    // Final Summary
    print('\n' + '═'.repeat(70), 'green');
    print('                    ✅ DEMONSTRATION COMPLETE', 'bright');
    print('═'.repeat(70) + '\n', 'green');
    
    printBox('SUMMARY', [
      `✅ MLAT calculations performed with quality scoring`,
      `✅ Rewards calculated using exponential quality curve`,
      `✅ ${statsResAfter.data.totalTransactions} reward transactions completed`,
      `✅ ${statsResAfter.data.totalRewardsDistributed.toFixed(6)} HBAR distributed`,
      `✅ All transactions logged to HCS topic ${hederaRes.data.topicId}`,
      `✅ Receiver profiles updated with reward data`,
      `✅ Leaderboard reflects top performers`,
      ``,
      `🌐 View in UI: http://localhost:5173/`,
      `🔗 View on HashScan: ${hederaRes.data.explorerUrl}`
    ]);
    
    print('\n💡 TIP: Run this demo multiple times to see rewards accumulate!', 'yellow');
    print('💡 TIP: Check the UI Receivers tab to see updated reward displays!', 'yellow');
    print('💡 TIP: Set ENABLE_REAL_TRANSFERS=true for actual HBAR transfers!\n', 'yellow');
    
  } catch (error) {
    print(`\n❌ Demo failed: ${error.message}`, 'red');
    if (error.response) {
      print(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
    }
  }
}

// Run the demo
print('\n⏳ Starting visual demonstration in 2 seconds...', 'yellow');
setTimeout(visualDemo, 2000);
