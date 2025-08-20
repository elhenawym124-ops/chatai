const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function restartServer() {
  console.log('🔄 Restarting server to apply image sending fixes...\n');
  
  try {
    // 1. العثور على عمليات Node.js الجارية
    console.log('🔍 Finding running Node.js processes...');
    
    const { stdout: processes } = await execPromise('tasklist | findstr node');
    console.log('📋 Current Node.js processes:');
    console.log(processes);
    
    // 2. قتل العمليات التي تستخدم المنافذ المطلوبة
    console.log('\n🛑 Stopping server processes...');
    
    const ports = [3000, 3001, 5000, 8000]; // المنافذ المحتملة
    
    for (const port of ports) {
      try {
        console.log(`🔍 Checking port ${port}...`);
        const { stdout: netstat } = await execPromise(`netstat -ano | findstr :${port}`);
        
        if (netstat.trim()) {
          console.log(`📍 Port ${port} is in use:`);
          console.log(netstat);
          
          // استخراج PID من netstat output
          const lines = netstat.trim().split('\n');
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            
            if (pid && !isNaN(pid)) {
              try {
                console.log(`🛑 Killing process ${pid} on port ${port}...`);
                await execPromise(`taskkill /F /PID ${pid}`);
                console.log(`✅ Process ${pid} killed successfully`);
              } catch (killError) {
                console.log(`⚠️ Could not kill process ${pid}: ${killError.message}`);
              }
            }
          }
        } else {
          console.log(`✅ Port ${port} is free`);
        }
      } catch (error) {
        console.log(`✅ Port ${port} is free (no processes found)`);
      }
    }
    
    // 3. انتظار قليل للتأكد من إغلاق العمليات
    console.log('\n⏳ Waiting for processes to close...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. بدء الخادم الجديد
    console.log('\n🚀 Starting server with image fixes...');
    
    // تشغيل الخادم في الخلفية
    const serverProcess = exec('npm start', {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore'
    });
    
    serverProcess.unref(); // السماح للعملية الأساسية بالإنهاء
    
    console.log(`✅ Server started with PID: ${serverProcess.pid}`);
    
    // 5. انتظار قليل ثم فحص حالة الخادم
    console.log('\n⏳ Waiting for server to initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 6. فحص إذا كان الخادم يعمل
    console.log('\n🔍 Checking server status...');
    
    try {
      const { stdout: newProcesses } = await execPromise('tasklist | findstr node');
      console.log('📋 New Node.js processes:');
      console.log(newProcesses);
      
      // فحص المنافذ مرة أخرى
      for (const port of [3000, 5000]) {
        try {
          const { stdout: portCheck } = await execPromise(`netstat -ano | findstr :${port}`);
          if (portCheck.trim()) {
            console.log(`✅ Server is running on port ${port}`);
          }
        } catch (error) {
          console.log(`⚠️ Port ${port} not in use yet`);
        }
      }
      
    } catch (error) {
      console.log('⚠️ Could not check server status:', error.message);
    }
    
    console.log('\n🎉 Server restart completed!');
    console.log('📝 The image sending fixes should now be active.');
    console.log('💡 Test by sending "عايزه اشوف الصور" to your Facebook page.');
    
  } catch (error) {
    console.error('❌ Error restarting server:', error);
  }
}

restartServer();
