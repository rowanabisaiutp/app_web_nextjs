export type AdminClientRow = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  blocked: boolean;
  createdAt: string;
  ordersCount: number;
};

/** Pedido en historial de un cliente */
export type ClientOrderRow = {
  id: number;
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  status: string;
  total: string;
  deliveryType: string;
  createdAt: string;
};
