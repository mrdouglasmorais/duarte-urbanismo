/**
 * Script para criar os 4 SUPER_ADMINs do sistema
 * 
 * Uso: node scripts/create-all-super-admins.js
 * 
 * Cria os seguintes SUPER_ADMINs:
 * 1. Daniel Duarte - Proprietário
 * 2. Douglas Morais - Diretor de tecnologia e negócios
 * 3. Gelvane Silva - Corretor Chefe
 * 4. Stephanie Santos - Administrativo
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

const SUPER_ADMINS = [
  {
    email: 'daniel.duarte@duarteurbanismo.com',
    password: 'Daniel2024!',
    name: 'Daniel Duarte',
    role: 'Proprietário'
  },
  {
    email: 'douglas.morais@duarteurbanismo.com',
    password: 'Douglas2024!',
    name: 'Douglas Morais',
    role: 'Diretor de tecnologia e negócios'
  },
  {
    email: 'gelvane.silva@duarteurbanismo.com',
    password: 'Gelvane2024!',
    name: 'Gelvane Silva',
    role: 'Corretor Chefe'
  },
  {
    email: 'stephanie.santos@duarteurbanismo.com',
    password: 'Stephanie2024!',
    name: 'Stephanie Santos',
    role: 'Administrativo'
  }
];

async function createAllSuperAdmins() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      bufferCommands: false,
    });
    console.log('✅ Conectado ao MongoDB\n');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const results = [];

    for (const admin of SUPER_ADMINS) {
      try {
        // Verificar se usuário já existe
        let existingUser = await User.findOne({ email: admin.email });

        if (existingUser) {
          console.log(`⚠️  Usuário ${admin.name} já existe. Atualizando...`);
          
          const passwordHash = await bcrypt.hash(admin.password, 12);
          existingUser.passwordHash = passwordHash;
          existingUser.role = 'SUPER_ADMIN';
          existingUser.status = 'APPROVED';
          existingUser.name = admin.name;
          
          await existingUser.save();
          
          results.push({
            success: true,
            action: 'updated',
            user: {
              email: existingUser.email,
              name: existingUser.name,
              role: existingUser.role,
              status: existingUser.status,
            },
            credentials: {
              email: admin.email,
              password: admin.password,
            }
          });
          
          console.log(`   ✅ ${admin.name} atualizado para SUPER_ADMIN`);
        } else {
          // Criar novo SUPER_ADMIN
          const passwordHash = await bcrypt.hash(admin.password, 12);
          
          const superAdmin = new User({
            email: admin.email,
            passwordHash,
            name: admin.name,
            role: 'SUPER_ADMIN',
            status: 'APPROVED',
          });

          await superAdmin.save();
          
          results.push({
            success: true,
            action: 'created',
            user: {
              email: superAdmin.email,
              name: superAdmin.name,
              role: superAdmin.role,
              status: superAdmin.status,
              id: superAdmin._id.toString(),
            },
            credentials: {
              email: admin.email,
              password: admin.password,
            }
          });
          
          console.log(`   ✅ ${admin.name} criado como SUPER_ADMIN`);
        }
      } catch (error) {
        console.error(`   ❌ Erro ao processar ${admin.name}:`, error.message);
        results.push({
          success: false,
          user: admin,
          error: error.message
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 RESUMO DOS SUPER_ADMINS CRIADOS/ATUALIZADOS');
    console.log('='.repeat(60) + '\n');

    results.forEach((result, index) => {
      if (result.success) {
        const admin = SUPER_ADMINS[index];
        console.log(`${index + 1}. ${admin.name} (${admin.role})`);
        console.log(`   Email: ${result.credentials.email}`);
        console.log(`   Senha: ${result.credentials.password}`);
        console.log(`   Status: ${result.user.status}`);
        console.log(`   Ação: ${result.action === 'created' ? 'Criado' : 'Atualizado'}\n`);
      } else {
        console.log(`❌ Erro ao processar: ${result.user.name}`);
        console.log(`   Erro: ${result.error}\n`);
      }
    });

    console.log('⚠️  IMPORTANTE: Altere as senhas após o primeiro login!');
    console.log('\n✅ Script concluído!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erro ao criar SUPER_ADMINs:', error);
    process.exit(1);
  }
}

createAllSuperAdmins();

