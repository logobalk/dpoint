const bcrypt = require('bcryptjs');

async function generatePasswordHashes() {
  const saltRounds = 12;
  
  // Demo passwords that meet the requirements
  const adminPassword = 'Admin123!';  // Has uppercase, lowercase, number, special char
  const employeePassword = 'Employee123!';  // Has uppercase, lowercase, number, special char
  
  try {
    const adminHash = await bcrypt.hash(adminPassword, saltRounds);
    const employeeHash = await bcrypt.hash(employeePassword, saltRounds);
    
    console.log('Demo Password Hashes Generated:');
    console.log('================================');
    console.log(`Admin Password: ${adminPassword}`);
    console.log(`Admin Hash: ${adminHash}`);
    console.log('');
    console.log(`Employee Password: ${employeePassword}`);
    console.log(`Employee Hash: ${employeeHash}`);
    console.log('');
    console.log('Update your demo-users.json file with these hashes.');
    
  } catch (error) {
    console.error('Error generating password hashes:', error);
  }
}

generatePasswordHashes();
