/**
 * Script para criar o primeiro SUPER_ADMIN
 * 
 * Uso: node scripts/create-super-admin.js
 * 
 * Este script cria um usuário SUPER_ADMIN com:
 * - Email: admin@duarteurbanismo.com
 * - Senha: admin123456
 * - Role: SUPER_ADMIN
 * - Status: APPROVED
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Hardcoded MongoDB URI
const MONGODB_URI = 'mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority';
const DB_NAME = 'duarte-urbanismo';

// Schema do User (simplificado para o script)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'CORRETOR'], required: true, default: 'CORRETOR' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], required: true, default: 'PENDING' },
  avatarUrl: { type: String },
}, {
  timestamps: true
});

async function createSuperAdmin() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
    });
    console.log('✅ Conectado ao MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Verificar se já existe SUPER_ADMIN
    const existingAdmin = await User.findOne({ role: 'SUPER_ADMIN', status: 'APPROVED' });
    if (existingAdmin) {
      console.log('⚠️  Já existe um SUPER_ADMIN aprovado no sistema:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nome: ${existingAdmin.name}`);
      console.log(`   ID: ${existingAdmin._id}`);
      await mongoose.disconnect();
      return;
    }

    // Dados do SUPER_ADMIN
    const adminEmail = 'admin@duarteurbanismo.com';
    const adminPassword = 'admin123456';
    const adminName = 'Administrador Principal';

    // Verificar se email já existe
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log(`⚠️  Usuário com email ${adminEmail} já existe.`);
      console.log('   Atualizando para SUPER_ADMIN...');
      
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      existingUser.passwordHash = passwordHash;
      existingUser.role = 'SUPER_ADMIN';
      existingUser.status = 'APPROVED';
      existingUser.name = adminName;
      
      await existingUser.save();
      console.log('✅ Usuário atualizado para SUPER_ADMIN com sucesso!');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Senha: ${adminPassword}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Status: ${existingUser.status}`);
    } else {
      // Criar novo SUPER_ADMIN
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      const superAdmin = new User({
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: 'SUPER_ADMIN',
        status: 'APPROVED',
      });

      await superAdmin.save();
      console.log('✅ SUPER_ADMIN criado com sucesso!');
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Senha: ${adminPassword}`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   Status: ${superAdmin.status}`);
      console.log(`   ID: ${superAdmin._id}`);
    }

    console.log('\n📝 Credenciais de acesso:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    await mongoose.disconnect();
    console.log('\n✅ Script concluído!');
  } catch (error) {
    console.error('❌ Erro ao criar SUPER_ADMIN:', error);
    process.exit(1);
  }
}

createSuperAdmin();

