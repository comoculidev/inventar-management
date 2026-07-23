# İnventar İdarəetmə Sistemi

**Azərbaycan Dili** | [English](#) (Yoxdur)

---

## Məzmun

- [Layihə Haqqında](#layihə-haqqında)
- [Texnologiyalar](#texnologiyalar)
- [Quraşdırma](#quraşdırma)
- [Konfiqurasiya](#konfiqurasiya)
- [İstifadə Qaydaları](#istifadə-qaydaları)
- [Sistem Arxitekturası](#sistem-arxitekturası)
- [API Sənədləri](#api-sənədləri)
- [İstifadəçi Rolları və İcazələr](#istifadəçi-rolları-və-icazələr)
- [UI Komponentləri](#ui-komponentləri)
- [Təhlükəsizlik](#təhlükəsizlik)
- [Lisenziya](#lisenziya)

---

## Layihə Haqqında

Bu, universitetlərin inventarını idarə etmək üçün nəzərdə tutulmuş tam funksionallı veb tətbiqdir. Sistem təşkilatlar, binalar və otaqlar hierarchiyası əsasında işləyir və iki istifadəçi rolunu dəstəkləyir: Admin və İstifadəçi.

### Əsas Xüsusiyyətlər

✅ **Hierarxik Struktur**: Təşkilatlar → Binalar → Otaqlar
✅ **İki İstifadəçi Rolu**: Admin (tam icazə) və İstifadəçi (məhdud icazə)
✅ **İnventar İdarəetməsi**: Form vasitəsi ilə və Excel faylından idxal etmək, redaktə etmək, silmək
✅ **Axtarış və Filtr**: Təşkilat, bina, kateqoriya üzrə filtrasiya
✅ **Tarixçə Qeydləri**: Bütün dəyişikliklərin tam audit izi
✅ **Autentifikasiya**: Cookie əsasında 7 gün müddətli sessiyalar
✅ **İdarə Paneli**: Sistem statistikası üçün dashboard

---

## Texnologiyalar

| Qat | Texnologiya |
|-----|------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL 12+ |
| Database Management | pgAdmin |
| Authentication | JWT + Cookie-based sessions |
| Password Hashing | bcryptjs |
| File Upload | multer |
| Excel Processing | xlsx (SheetJS) |
| UUID Generation | uuid |

---

## Quraşdırma

### Təlabatlar

- Node.js 18+ 
- PostgreSQL 12+
- pgAdmin (isteğe bağlı, lakin tövsiyə olunur)

### Quraşdırma Addımları

1. **Repository-u klonlayın:**
   ```bash
   git clone https://github.com/comoculidev/inventar-management.git
   cd inventar-management
   ```

2. **Asılılıqları quraşdırın:**
   ```bash
   npm install
   ```

3. **Mühit dəyişənlərini konfiqurasiya edin:**
   ```bash
   cp .env.example .env
   ```
   
   `.env` faylını redaktə edin:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_secure_jwt_secret_here
   
   # PostgreSQL Konfiqurasiya
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=inventar_db
   DB_USER=postgres
   DB_PASSWORD=your_db_password
   ```

4. **PostgreSQL bazasını yaradın:**
   ```bash
   createdb inventar_db
   ```

5. **Tətbiqi işə salın:**
   ```bash
   npm start
   ```
   
   Və ya development rejimində:
   ```bash
   npm run dev
   ```

6. **Veb interfeysinə daxil olun:**
   - Açın: http://localhost:3000
   - Admin daxil olmaq üçün:
     - İstifadəçi adı: `admin`
     - Şifrə: `admin123`
   - Adi istifadəçi üçün:
     - İstifadəçi adı: `user`
     - Şifrə: `user123`

---

## Konfiqurasiya

### Database Schema

Sistem aşağıdakı cədvəlləri istifadə edir:

- **organizations**: Təşkilatlar
- **buildings**: Binalar (təşkilata bağlı)
- **rooms**: Otaqlar (binaya bağlı)
- **inventory_items**: İnventar elementləri (otağa bağlı)
- **users**: İstifadəçilər
- **history_logs**: Dəyişikliklərin tarixçəsi
- **migrations**: Migration izləmə cədvəli

### Avtomatik Seed

Tətbiq ilk dəfə işə salındıqda avtomatik olaraq aşağıdakı istifadəçiləri yaradacaq:

| İstifadəçi Adı | Şifrə | Rol |
|----------------|-------|-----|
| admin | admin123 | admin |
| user | user123 | user |

---

## İstifadə Qaydaları

### Admin Panel

Admin istifadəçiləri aşağıdakı funksionallığa malikdirlər:

1. **Dashboard**: Sistem statistikası (təşkilatlar, binalar, otaqlar, inventar elementləri, istifadəçilər)
2. **Təşkilatlar**: Təşkilatları idarə etmək (CRUD)
3. **Binalar**: Binaları idarə etmək (CRUD)
4. **Otaqlar**: Otaqları idarə etmək (CRUD)
5. **İnventar**: İnventar elementlərini idarə etmək
   - Yeni element əlavə etmək
   - Excel faylından idxal etmək
   - Elementləri redaktə etmək
   - Elementləri silmək
   - Axtarış və filtrasiya
6. **İstifadəçilər**: İstifadəçiləri idarə etmək (CRUD)
7. **Tarixçə**: Bütün dəyişikliklərin tarixçəsini görmək və ixrac etmək

### İstifadəçi Panel

Adi istifadəçilər aşağıdakı funksionallığa malikdirlər:

1. **Dashboard**: Şəxsi statistika (mənim inventar elementlərim)
2. **Mənim İnventarım**: Mənim məsul olduğum elementləri görmək
   - Axtarış
   - Status üzrə filtrasiya
3. **Profilim**: İstifadəçi məlumatlarını görmək

---

## Sistem Arxitekturası

```
inventar-management/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js
│   ├── buildingsController.js
│   ├── dashboardController.js
│   ├── historyLogsController.js
│   ├── inventoryItemsController.js
│   ├── organizationsController.js
│   ├── roomsController.js
│   ├── userController.js
│   └── usersController.js
├── middleware/
│   ├── authMiddleware.js  # Authentication middleware
│   └── roleMiddleware.js  # Role-based access control
├── migrations/
│   └── *.sql             # Database migrations
├── models/
│   ├── building.js
│   ├── dashboard.js
│   ├── historyLog.js
│   ├── inventoryItem.js
│   ├── organization.js
│   ├── room.js
│   └── user.js
├── public/
│   ├── css/
│   │   ├── admin.css
│   │   └── base.css
│   └── js/
│       ├── admin/
│       │   ├── dashboard.js
│       │   ├── history.js
│       │   ├── inventory.js
│       │   ├── room-detail.js
│       │   └── rooms.js
│       ├── main.js
│       ├── user-my-items.js
│       ├── user-panel.js
│       └── user-profile.js
├── routes/
│   ├── auth.js
│   ├── buildings.js
│   ├── dashboard.js
│   ├── historyLogs.js
│   ├── inventoryItems.js
│   ├── organizations.js
│   ├── rooms.js
│   ├── user.js
│   └── users.js
├── utils/
│   ├── excelImport.js
│   ├── migrationRunner.js
│   └── seedAdminUser.js
├── views/
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── history.html
│   │   ├── inventory.html
│   │   ├── room-detail.html
│   │   └── rooms.html
│   ├── index.html
│   ├── user-my-items.html
│   ├── user-panel.html
│   └── user-profile.html
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## API Sənədləri

### Base URL
```
http://localhost:3000/api
```

### Autentifikasiya

#### POST /api/auth/register
Register yeni istifadəçi

**Request Body:**
```json
{
  "username": "istifadeci_adi",
  "password": "sifre123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { ... }
}
```

#### POST /api/auth/login
Daxil olmaq

**Request Body:**
```json
{
  "username": "istifadeci_adi",
  "password": "sifre123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "...",
      "role": "admin|user"
    },
    "redirect": "/admin-dashboard" // or "/user-panel"
  }
}
```

#### POST /api/auth/logout
Çıxış etmək

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
Cari istifadəçi məlumatları

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### Təşkilatlar

#### GET /api/organizations
Bütün təşkilatları almaq

#### POST /api/organizations
Yeni təşkilat yaratmaq

#### GET /api/organizations/:id
Təşkilatı almaq

#### PUT /api/organizations/:id
Təşkilatı yeniləmək

#### DELETE /api/organizations/:id
Təşkilatı silmək

### Binalar

#### GET /api/buildings
Bütün binaları almaq

**Query Parameters:**
- `organizationId`: Təşkilata görə filtr

#### POST /api/buildings
Yeni bina yaratmaq

#### GET /api/buildings/:id
Bina almaq

#### PUT /api/buildings/:id
Bina yeniləmək

#### DELETE /api/buildings/:id
Bina silmək

### Otaqlar

#### GET /api/rooms
Bütün otaqları almaq

**Query Parameters:**
- `organizationId`: Təşkilata görə filtr
- `buildingId`: Binaya görə filtr
- `search`: Ad üzrə axtarış
- `page`: Səhifə nömrəsi
- `limit`: Səhifədə element sayı

#### GET /api/rooms/:id
Otaq almaq

#### GET /api/rooms/:id/items
Otağın inventar elementləri

#### POST /api/rooms
Yeni otaq yaratmaq

#### PUT /api/rooms/:id
Otaq yeniləmək

#### DELETE /api/rooms/:id
Otaq silmək

### İnventar Elementləri

#### GET /api/inventory-items
Bütün inventar elementlərini almaq

**Query Parameters:**
- `roomId`: Otağa görə filtr
- `organizationId`: Təşkilata görə filtr
- `buildingId`: Binaya görə filtr
- `category`: Kateqoriya üzrə filtr
- `status`: Status üzrə filtr
- `search`: Axtarış
- `page`: Səhifə nömrəsi
- `limit`: Səhifədə element sayı

#### GET /api/inventory-items/:id
İnventar elementini almaq

#### POST /api/inventory-items
Yeni inventar elementi yaratmaq

#### PUT /api/inventory-items/:id
İnventar elementini yeniləmək

#### DELETE /api/inventory-items/:id
İnventar elementini silmək

#### POST /api/inventory-items/bulk
Çoxlu inventar elementləri yaratmaq (JSON)

#### POST /api/inventory-items/import
Excel faylından idxal etmək

**Request:**
- `file`: Excel faylı (.xlsx)

### Tarixçə

#### GET /api/history
Bütün tarixçə qeydlərini almaq

#### GET /api/history/date-range
Tarix aralığına görə filtr

**Query Parameters:**
- `startDate`: Başlanğıc tarix (YYYY-MM-DD)
- `endDate`: Bitmə tarix (YYYY-MM-DD)
- `actionType`: Əməliyyat növü (create, update, delete)
- `search`: Axtarış
- `page`: Səhifə nömrəsi
- `limit`: Səhifədə qeyd sayı

### Dashboard

#### GET /api/dashboard/stats
Dashboard statistikası

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrganizations": 5,
    "totalBuildings": 10,
    "totalRooms": 20,
    "totalItems": 100,
    "totalUsers": 2
  }
}
```

### User API (İstifadəçi üçün)

#### GET /api/user/me
Cari istifadəçi məlumatları

#### GET /api/user/my-items
Mənim məsul olduğum elementlər

**Query Parameters:**
- `search`: Axtarış
- `status`: Status üzrə filtr
- `page`: Səhifə nömrəsi
- `limit`: Səhifədə element sayı

#### GET /api/user/stats
Şəxsi statistika

---

## İstifadəçi Rolları və İcazələr

### Admin Rolu

- **Tam İcazə**: Bütün funksionallığa giriş var
- **İdarə Paneli**: /admin/*
- **Funksionallar:**
  - Təşkilat, bina, otaq idarəetməsi
  - İnventar elementləri idarəetməsi
  - İstifadəçiləri idarəetməsi
  - Tarixçəni görmək və ixrac etmək
  - Dashboard statistikası

### İstifadəçi Rolu

- **Məhdud İcazə**: Yalnız şəxsi məlumatlara giriş var
- **İstifadəçi Paneli**: /user-panel/*
- **Funksionallar:**
  - Şəxsi statistikani görmək
  - Mənim məsul olduğum inventar elementlərini görmək
  - Profil məlumatlarını görmək

### Route Müdafiəsi

- **Admin Routes** (`/admin/*`): Yalnız admin istifadəçiləri
  - Status Code: 403 Forbidden (əgər istifadəçi admin deyilsə)
  
- **User Routes** (`/user-panel/*`): Yalnız adi istifadəçilər
  - Status Code: 403 Forbidden (əgər istifadəçi admin dirsə)
  
- **API Routes**: Role əsaslı middleware ilə qorunur

---

## UI Komponentləri

### Admin Panel

1. **Dashboard** (`/admin/dashboard`)
   - Statistika kartları
   - Sürətli əməliyyatlar

2. **İnventar** (`/admin/inventory`)
   - Elementlər cədvəli
   - Axtarış və filtr panel
   - Yeni element əlavə etmək modal
   - Excel idxal modal
   - Redaktə modal
   - Silmək təsdiq modal

3. **Otaqlar** (`/admin/rooms`)
   - Otaqlar cədvəli
   - Axtarış və filtr
   - Yeni otaq əlavə etmək
   - Otağı redaktə etmək
   - Otağı silmək
   - Otağın elementlərini görmək

4. **Otaq Detalları** (`/organization/building/room/:id`)
   - Otaq məlumatları
   - Otağın elementləri cədvəli
   - Filtrasiya
   - Yeni element əlavə etmək
   - Excel idxal

5. **Tarixçə** (`/admin/history`)
   - Tarix aralığı filtr
   - Axtarış
   - Əməliyyat növü filtr
   - Tarixçə cədvəli
   - CSV ixrac

### İstifadəçi Panel

1. **Dashboard** (`/user-panel`)
   - Şəxsi statistika kartları
   - Sürətli əməliyyatlar

2. **Mənim İnventarım** (`/user-panel/my-items`)
   - Mənim elementlər cədvəli
   - Axtarış və filtr

3. **Profilim** (`/user-panel/profile`)
   - İstifadəçi məlumatları

---

## Təhlükəsizlik

### Autentifikasiya

- **JWT Token**: JSON Web Token istifadə olunur
- **Cookie**: HttpOnly, Secure (productionda)
- **Müddət**: 7 gün
- **Şifrə Hash**: bcryptjs ilə hashlanır

### İcazə Yoxlama

- **Role-Based Access Control (RBAC)**: İstifadəçi rolları əsaslı icazə yoxlaması
- **Middleware**: Hər route üçün müvafiq middleware istifadə olunur
- **403 Forbidden**: İcazə olmadıqda qayıdılır

### Məlumat Qorunması

- Şifrələr hash şəklində saxlanılır
- JWT token HttpOnly cookie-də saxlanılır
- Məlumatlar PostgreSQL-də saxlanılır

---

## Lisenziya

Bu layihə MIT Lisenziya ilə buraxılır. Ətraflı məlumat üçün [LICENSE](LICENSE) faylına baxın.

---

## Əlaqə

Suallarınız varsa, zəhmət olmasa [GitHub](https://github.com/comoculidev/inventar-management) səhifəsinə müraciət edin.

---

*Son yenilənmə: 2024-07-23*
*Versiya: 1.0.0*
