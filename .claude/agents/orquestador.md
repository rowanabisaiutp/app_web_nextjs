---
name: orquestador
descripcion: lanza 3 subagentes para que trabajen en paralelo:
  - code-reviewer: revisa el codigo y genera una
  documentacion de la arquitectura y un plan de refactorizacion.
  - code-quality-auditor: realiza una auditoria de calidad del codigo y genera un plan de refactorizacion.
  - code-refactorer: implementa el plan de refactorizacion, detecta errores y corrige