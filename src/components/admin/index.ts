/** UI genérica del panel admin (Card, Table, Header, Pagination) */
export { AdminPageHeader, AdminCard, AdminTable, AdminPagination, type AdminTableColumn } from "./ui";

/** Componentes del dominio Pedidos/Órdenes */
export { OrderDetailContent, getOrderListColumns } from "./orders";

/** Componentes del dominio Auth y roles (usuarios del panel) */
export { getUsersTableColumns, type UsersTableColumnsParams } from "./auth";

/** Componentes del dominio Clientes */
export {
  getClientsTableColumns,
  ClientDetailContent,
  type ClientsTableColumnsParams,
  type ClientDetailForm,
} from "./clients";
