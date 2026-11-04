import { z } from "zod";

const text = (min: number, max = 200) => z.string().min(min).max(max);

/** Corpo aceito pelo /api/checkout. Todo texto tem tamanho máximo; a lista de itens também. */
export const checkoutSchema = z.object({
  customer: z.object({
    firstName: text(2),
    lastName: text(2),
    cpf: z.string().max(20).optional(),
    phone: text(8, 30),
    email: z.string().email().max(200)
  }),
  address: z.object({
    zipCode: text(8, 12),
    street: text(2),
    number: text(1, 20),
    complement: z.string().max(200).optional(),
    district: text(2),
    city: text(2),
    state: z.string().min(2).max(2)
  }),
  items: z
    .array(
      z.object({
        productId: z.string().max(100),
        variantId: z.string().max(100),
        quantity: z.number().int().positive().max(20)
      })
    )
    .min(1)
    .max(50),
  couponCode: z.string().max(50).optional(),
  shippingOptionId: z.string().max(50),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD"]),
  turnstileToken: z.string().max(2048).optional()
});
