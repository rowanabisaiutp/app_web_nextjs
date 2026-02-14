# Documentación de API para clientes (consumo desde Flutter)

Esta documentación describe cómo consumir la API desde una aplicación móvil Flutter (cliente). Sirve como contrato entre el backend Next.js y la app.

---

## Información general

| Concepto          | Valor                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| **Base URL**      | `https://tu-dominio.com` (producción) o `http://localhost:3000` (desarrollo) |
| **Formato**       | JSON (`Content-Type: application/json`), UTF-8                               |
| **Autenticación** | Ver sección [Autenticación](#autenticación)                                  |

### Códigos HTTP

| Código | Significado                                 |
| ------ | ------------------------------------------- |
| `200`  | OK                                          |
| `400`  | Bad Request – datos inválidos o faltantes   |
| `401`  | No autorizado – sin sesión o token inválido |
| `403`  | Sin permiso – rol insuficiente              |
| `409`  | Conflicto – p. ej. email ya registrado      |
| `500`  | Error interno del servidor                  |

Las respuestas de error suelen incluir un cuerpo JSON con el campo `error` (string):

```json
{ "error": "Mensaje descriptivo" }
```

---

## Autenticación

La API actual usa **cookies** para la sesión (`admin_session`, HttpOnly). Para una app Flutter nativa es recomendable que el backend exponga también **token JWT en el cuerpo** y acepte el header `Authorization: Bearer <token>` en las peticiones. Mientras tanto, la app puede:

- Usar un cliente HTTP que guarde y envíe cookies (p. ej. `CookieManager` con `dio_cookie_manager`), o
- Esperar a que el backend añada soporte Bearer y documentar aquí la URL y formato.

En esta doc se describe el contrato actual (cookies) y el cuerpo de las respuestas para que Flutter pueda mostrar datos (p. ej. `user`) aunque el almacenamiento de sesión sea por cookies.

---

## Endpoints

### 1. Registro de usuario

Crea una cuenta. El usuario queda con rol `ADMIN` en el sistema actual.

**Request**

| Método | URL                  |
| ------ | -------------------- |
| `POST` | `/api/auth/register` |

**Headers**

```
Content-Type: application/json
```

**Body (JSON)**

| Campo      | Tipo   | Obligatorio | Descripción                       |
| ---------- | ------ | ----------- | --------------------------------- |
| `email`    | string | Sí          | Email (se normaliza a minúsculas) |
| `password` | string | Sí          | Mínimo 8 caracteres               |
| `name`     | string | No          | Nombre mostrado                   |

**Ejemplo**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123",
  "name": "Juan Pérez"
}
```

**Respuesta exitosa (200)**

```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "ADMIN"
  },
  "message": "Cuenta creada. Ya puedes iniciar sesión."
}
```

**Errores**

| Status | Condición                    | `error` (ejemplo)                                  |
| ------ | ---------------------------- | -------------------------------------------------- |
| 400    | Faltan email o password      | `"Email y contraseña son obligatorios"`            |
| 400    | Email vacío tras normalizar  | `"Email no válido"`                                |
| 400    | Contraseña &lt; 8 caracteres | `"La contraseña debe tener al menos 8 caracteres"` |
| 409    | Email ya existe              | `"Ya existe una cuenta con este email"`            |
| 500    | Error interno                | `"Error al crear la cuenta"`                       |

---

### 2. Inicio de sesión (login)

Inicia sesión y establece la cookie de sesión en la respuesta.

**Request**

| Método | URL               |
| ------ | ----------------- |
| `POST` | `/api/auth/login` |

**Headers**

```
Content-Type: application/json
```

**Body (JSON)**

| Campo      | Tipo   | Obligatorio |
| ---------- | ------ | ----------- |
| `email`    | string | Sí          |
| `password` | string | Sí          |

**Ejemplo**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa (200)**

```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
  }
}
```

**Errores**

| Status | Condición                | `error`                                 |
| ------ | ------------------------ | --------------------------------------- |
| 400    | Faltan email o password  | `"Email y contraseña son obligatorios"` |
| 401    | Credenciales incorrectas | `"Credenciales incorrectas"`            |
| 500    | Error interno            | `"Error al iniciar sesión"`             |

**Nota:** La sesión se guarda en una cookie. En Flutter, si usas `dio` + `dio_cookie_manager` + `cookie_jar`, debes usar el mismo `Dio` (o mismo `CookieJar`) para las peticiones subsiguientes para que envíe la cookie.

---

### 3. Obtener usuario actual (me)

Devuelve el usuario de la sesión actual. Requiere que la cookie de sesión esté enviada.

**Request**

| Método | URL            |
| ------ | -------------- |
| `GET`  | `/api/auth/me` |

**Headers**

- Cookie enviada automáticamente si el cliente guarda cookies de la respuesta de login.

**Respuesta exitosa (200)**

```json
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "ADMIN"
  }
}
```

**Sin sesión o token inválido (401)**

```json
{
  "user": null
}
```

---

### 4. Cerrar sesión (logout)

Invalida la sesión (borra la cookie).

**Request**

| Método | URL                |
| ------ | ------------------ |
| `POST` | `/api/auth/logout` |

No requiere body. Opcionalmente se puede enviar la cookie para que el servidor la borre.

**Respuesta exitosa (200)**

```json
{
  "ok": true
}
```

---

## Uso desde Flutter (Dart)

### Dependencias sugeridas

```yaml
dependencies:
  dio: ^5.4.0
  dio_cookie_manager: ^3.1.1
  cookie_jar: ^4.0.8
  flutter_secure_storage: ^9.0.0 # si más adelante usas JWT en lugar de cookies
```

### Cliente base con cookies (ejemplo)

```dart
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';

class ApiClient {
  late final Dio _dio;
  static const String baseUrl = 'https://tu-dominio.com'; // o tu env

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    // Persistir cookies para que login guarde la sesión y el resto de peticiones la envíen
    _dio.interceptors.add(CookieManager(CookieJar()));
  }

  // ----- Auth -----

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? name,
  }) async {
    final res = await _dio.post('/api/auth/register', data: {
      'email': email,
      'password': password,
      if (name != null && name.isNotEmpty) 'name': name,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _dio.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>?> me() async {
    try {
      final res = await _dio.get('/api/auth/me');
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) return {'user': null};
      rethrow;
    }
  }

  Future<void> logout() async {
    await _dio.post('/api/auth/logout');
  }
}
```

### Modelos de ejemplo (Dart)

```dart
class User {
  final int id;
  final String email;
  final String? name;
  final String role;

  User({
    required this.id,
    required this.email,
    this.name,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      email: json['email'] as String,
      name: json['name'] as String?,
      role: json['role'] as String? ?? 'ADMIN',
    );
  }
}

// Uso tras login o /me
final data = await api.login(email: 'a@b.com', password: 'pass');
final user = data['user'] != null ? User.fromJson(data['user'] as Map<String, dynamic>) : null;
```

### Tratamiento de errores

```dart
try {
  await api.login(email: email, password: password);
} on DioException catch (e) {
  final status = e.response?.statusCode;
  final body = e.response?.data;
  final message = body is Map && body['error'] != null
      ? body['error'] as String
      : 'Error de conexión';
  // Mostrar message en la UI
}
```

---

## Posibles extensiones para la app móvil

Si en el futuro el backend expone endpoints **públicos o para clientes** (por ejemplo menú, crear pedido, aplicar cupón), seguirían la misma base URL y convenciones:

- **GET** sin auth (o con token opcional): listar categorías, productos, combos, promociones activas.
- **POST** con sesión/token: crear pedido, validar cupón.

Cuando existan, se añadirán a este documento con el mismo formato (método, URL, body, respuestas y códigos).

---

## Resumen de endpoints (clientes)

| Método | Ruta                 | Descripción              |
| ------ | -------------------- | ------------------------ |
| `POST` | `/api/auth/register` | Registro                 |
| `POST` | `/api/auth/login`    | Login (establece cookie) |
| `GET`  | `/api/auth/me`       | Usuario actual           |
| `POST` | `/api/auth/logout`   | Cerrar sesión            |

Todos los endpoints de la API bajo `/api/v1/*` requieren sesión de administrador y están pensados para el panel web; no se documentan aquí como parte del contrato para la app móvil cliente.
