/** Tipos, constantes y helpers compartidos del panel admin por dominio */
export {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_BADGE,
  formatOrderFromApi,
  formatOrderDetailFromApi,
  type OrderRow,
  type OrderDetailRow,
  type OrderItemRow,
} from "./orders";

export { formatUserFromApi, type AdminUserRow } from "./users";

export { type AdminClientRow, type ClientOrderRow } from "./clients";
