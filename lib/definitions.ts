import { z } from "zod";

// ============ Auth ============
export const LoginSchema = z.object({
  email: z.string().min(1, { message: "Email wajib diisi" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Password saat ini wajib diisi" }),
    newPassword: z
      .string()
      .min(6, { message: "Password baru minimal 6 karakter" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru tidak cocok",
    path: ["confirmPassword"],
  });

// ============ Product ============
export const ProductSchema = z.object({
  name: z.string().min(1, { message: "Nama produk wajib diisi" }),
  sku: z.string().min(1, { message: "SKU wajib diisi" }),
  categoryId: z.string().min(1, { message: "Kategori wajib dipilih" }),
  size: z.string().min(1, { message: "Ukuran wajib diisi" }),
  color: z.string().min(1, { message: "Warna wajib diisi" }),
  costPrice: z.number().min(0, { message: "Harga modal harus >= 0" }),
  sellingPrice: z.number().min(0, { message: "Harga jual harus >= 0" }),
  stock: z.number().int().min(0, { message: "Stok harus >= 0" }),
  minimumStock: z.number().int().min(0, { message: "Stok minimum harus >= 0" }),
  isActive: z.boolean().default(true),
});

export const CategorySchema = z.object({
  name: z.string().min(1, { message: "Nama kategori wajib diisi" }),
});

// ============ Supplier ============
export const SupplierSchema = z.object({
  name: z.string().min(1, { message: "Nama supplier wajib diisi" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// ============ Purchase ============
export const PurchaseItemSchema = z.object({
  productId: z.string().min(1, { message: "Produk wajib dipilih" }),
  quantity: z.number().int().min(1, { message: "Jumlah harus >= 1" }),
  costPrice: z.number().min(0, { message: "Harga modal harus >= 0" }),
});

export const PurchaseSchema = z.object({
  supplierId: z.string().min(1, { message: "Supplier wajib dipilih" }),
  purchaseDate: z.string().min(1, { message: "Tanggal wajib diisi" }),
  notes: z.string().optional(),
  items: z
    .array(PurchaseItemSchema)
    .min(1, { message: "Minimal 1 item pembelian" }),
});

// ============ Sale ============
export const SaleItemSchema = z.object({
  productId: z.string().min(1, { message: "Produk wajib dipilih" }),
  quantity: z.number().int().min(1, { message: "Jumlah harus >= 1" }),
  sellingPrice: z.number().min(0, { message: "Harga jual harus >= 0" }),
  discount: z.number().min(0).default(0),
});

export const SaleSchema = z.object({
  salesDate: z.string().min(1, { message: "Tanggal wajib diisi" }),
  paymentMethod: z.string().min(1, { message: "Metode bayar wajib dipilih" }),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z
    .array(SaleItemSchema)
    .min(1, { message: "Minimal 1 item penjualan" }),
});

// ============ Cashflow ============
export const ManualCashflowSchema = z.object({
  type: z.enum(["income", "expense"], {
    message: "Jenis transaksi wajib dipilih",
  }),
  category: z.string().min(1, { message: "Kategori wajib dipilih" }),
  amount: z.number().min(1, { message: "Nominal harus > 0" }),
  cashflowDate: z.string().min(1, { message: "Tanggal wajib diisi" }),
  notes: z.string().optional(),
});

// ============ Stock Adjustment ============
export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1, { message: "Produk wajib dipilih" }),
  type: z.enum(["in", "out", "adjustment"], {
    message: "Tipe wajib dipilih",
  }),
  quantity: z.number().int().min(1, { message: "Jumlah harus >= 1" }),
  notes: z.string().min(1, { message: "Alasan wajib diisi" }),
});

// ============ Settings ============
export const ProfileSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
});




// ============ Types ============
export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
};

export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export type GeneralFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};
