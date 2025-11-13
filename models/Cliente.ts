import mongoose, { Schema, Document, Model } from 'mongoose';
import { connectMongo } from '@/lib/mongoose';
import bcrypt from 'bcryptjs';

export interface ICliente extends Document {
  cpf: string;
  senha: string;
  nome: string;
  email?: string;
  telefone?: string;
  numeroContrato?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const ClienteSchema = new Schema<ICliente>(
  {
    cpf: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    senha: {
      type: String,
      required: true,
    },
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    telefone: {
      type: String,
      trim: true,
    },
    numeroContrato: {
      type: String,
      trim: true,
      index: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash da senha antes de salvar
ClienteSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar senha
ClienteSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.senha);
};

// Remover senha do JSON
ClienteSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.senha;
  return obj;
};

const Cliente: Model<ICliente> = mongoose.models.Cliente || mongoose.model<ICliente>('Cliente', ClienteSchema);

export default Cliente;

