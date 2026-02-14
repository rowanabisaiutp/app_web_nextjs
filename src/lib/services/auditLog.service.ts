import { prisma } from "@/lib/prisma";
import type { AuditLogType } from "@/generated/prisma/enums";
import type { AuditLogWhereInput } from "@/generated/prisma/models/AuditLog";

export type AuditLogDto = {
  id: number;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  resourceType: string;
  resourceId: number | null;
  detail: string | null;
  oldValue: string | null;
  newValue: string | null;
  logType: string | null;
  createdAt: Date;
};

export type ListAuditLogsFilters = {
  search?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  logType?: AuditLogType | "todos";
  userId?: number;
  limit?: number;
  offset?: number;
};

/**
 * Lista logs de auditoría con filtros opcionales.
 */
export async function listAuditLogs(filters: ListAuditLogsFilters = {}): Promise<{
  logs: AuditLogDto[];
  total: number;
}> {
  const { search, from, to, logType, userId, limit = 50, offset = 0 } = filters;

  const where: AuditLogWhereInput = {};

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    where.OR = [
      { action: { contains: q } },
      { resourceType: { contains: q } },
      { detail: { contains: q } },
      { oldValue: { contains: q } },
      { newValue: { contains: q } },
      { user: { email: { contains: q } } },
      { user: { name: { contains: q } } },
    ];
  }

  if (from || to) {
    where.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      (where.createdAt as Record<string, Date>).gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      (where.createdAt as Record<string, Date>).lte = toDate;
    }
  }

  if (logType && logType !== "todos") {
    where.logType = logType;
  }

  if (userId != null) {
    where.userId = userId;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      skip: offset,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const dtos: AuditLogDto[] = logs.map((l) => ({
    id: l.id,
    userId: l.userId,
    userEmail: l.user?.email ?? null,
    userName: l.user?.name ?? null,
    action: l.action,
    resourceType: l.resourceType,
    resourceId: l.resourceId,
    detail: l.detail,
    oldValue: l.oldValue,
    newValue: l.newValue,
    logType: l.logType,
    createdAt: l.createdAt,
  }));

  return { logs: dtos, total };
}

/**
 * Obtiene un log por ID.
 */
export async function getAuditLogById(id: number): Promise<AuditLogDto | null> {
  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!log) return null;
  return {
    id: log.id,
    userId: log.userId,
    userEmail: log.user?.email ?? null,
    userName: log.user?.name ?? null,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    detail: log.detail,
    oldValue: log.oldValue,
    newValue: log.newValue,
    logType: log.logType,
    createdAt: log.createdAt,
  };
}

export type CreateAuditLogInput = {
  userId?: number | null;
  action: string;
  resourceType: string;
  resourceId?: number | null;
  detail?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  logType?: AuditLogType | null;
};

/**
 * Crea un registro de auditoría. Usar desde otros servicios (login, cambio de estado, etc.).
 */
export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLogDto> {
  const log = await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action.substring(0, 100),
      resourceType: input.resourceType.substring(0, 50),
      resourceId: input.resourceId ?? null,
      detail: input.detail ?? null,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      logType: input.logType ?? null,
    },
    include: { user: { select: { email: true, name: true } } },
  });
  return {
    id: log.id,
    userId: log.userId,
    userEmail: log.user?.email ?? null,
    userName: log.user?.name ?? null,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    detail: log.detail,
    oldValue: log.oldValue,
    newValue: log.newValue,
    logType: log.logType,
    createdAt: log.createdAt,
  };
}
