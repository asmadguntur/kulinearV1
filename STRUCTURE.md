# Struktur Folder KULINEAR

Dokumen ini menjelaskan susunan folder `src/` setelah penyederhanaan arsitektur.

Prinsipnya: **satu folder per jenis file, maksimal dua tingkat kedalaman.**
Untuk mencari sesuatu cukup tanya "ini file apa?", bukan "ini fitur apa?" —
halaman selalu di `pages/`, pemanggilan API selalu di `api/`, dan seterusnya.

Total 29 file. Tidak ada folder `features/` bertingkat, tidak ada import `../../../`.

---

## Pohon Folder

```
kulinear/
├── index.html                  Titik masuk HTML, memuat /src/main.jsx
├── vite.config.js              Plugin React + Tailwind, alias "@" -> ./src
├── jsconfig.json               Alias "@" untuk autocomplete editor
├── .env                        VITE_API_URL, VITE_API_KEY
├── .oxlintrc.json              Konfigurasi linter
├── README.md
├── STRUCTURE.md                Dokumen ini
├── public/                     Aset statis (favicon.svg, icons.svg)
│
└── src/
    ├── main.jsx                Render <RouterProvider> ke #root
    ├── router.jsx              Seluruh definisi route aplikasi
    ├── constants.js            ROUTES (semua path) + ROLES (admin/user)
    ├── index.css               Tailwind, font, dan theme token warna
    │
    ├── api/                    Satu-satunya lapisan yang bicara ke backend
    │   ├── client.js           Instance axios + interceptor
    │   ├── endpoints.js        Daftar path endpoint API
    │   ├── auth.js             registerUser, loginUser, logoutUser
    │   └── foods.js            getFoods, getFoodById
    │
    ├── lib/                    Helper murni, tanpa React
    │   ├── authStorage.js      Baca/tulis token & user di localStorage
    │   └── format.js           formatPrice
    │
    ├── hooks/                  Jembatan antara api/ dan komponen
    │   └── useFoods.js         useFoods, useFoodDetail
    │
    ├── layouts/                Pembungkus route
    │   ├── MainLayout.jsx      Navbar + <Outlet /> + Footer
    │   ├── AuthLayout.jsx      Latar polos untuk login & register
    │   ├── AdminLayout.jsx     Sidebar admin + <Outlet />
    │   ├── Navbar.jsx          Bagian dari MainLayout
    │   ├── Footer.jsx          Bagian dari MainLayout
    │   └── RouteGuard.jsx      ProtectedRoute + AdminRoute
    │
    ├── components/             Komponen UI yang dipakai ulang
    │   ├── FoodCard.jsx        Kartu satu makanan
    │   └── FoodList.jsx        Grid FoodCard + empty state
    │
    ├── pages/                  Satu file = satu halaman
    │   ├── LandingPage.jsx     "/"                     publik
    │   ├── AuthPage.jsx        "/login" & "/register"  dibedakan prop mode
    │   ├── HomePage.jsx        "/home"                 butuh login
    │   ├── FoodPage.jsx        "/foods"                daftar makanan dari API
    │   ├── FoodDetailPage.jsx  "/foods/:foodId"
    │   ├── CartPage.jsx        "/cart" & "/checkout"
    │   ├── UnauthorizedPage.jsx "/unauthorized"
    │   ├── NotFoundPage.jsx    "*"
    │   └── PlaceholderPage.jsx Halaman sementara untuk route yang belum jadi
    │
    └── data/
        └── demoFoods.js        Data contoh untuk halaman yang belum tersambung API
```

---

## Tanggung Jawab Tiap Lapisan

| Folder | Isinya | Boleh import dari | Tidak boleh import |
|---|---|---|---|
| `api/` | Panggilan HTTP, bentuk request/response | `lib/` | `hooks/`, `components/`, `pages/` |
| `lib/` | Fungsi murni & akses browser storage | — | apa pun di dalam `src/` |
| `hooks/` | State loading/error/data untuk komponen | `api/`, `lib/` | `components/`, `pages/` |
| `components/` | Potongan UI yang dipakai ulang | `lib/`, `constants` | `api/`, `pages/` |
| `layouts/` | Kerangka halaman & penjaga route | `lib/`, `constants` | `api/`, `pages/` |
| `pages/` | Satu layar penuh | semuanya | — |
| `data/` | Data statis | — | apa pun di dalam `src/` |

### Arah Dependensi

```
pages  ──►  hooks  ──►  api  ──►  lib
  │
  ├───────►  components  ──►  lib
  └───────►  layouts     ──►  lib
```

Panah hanya boleh mengalir ke kanan. Kalau ada file di `api/` yang butuh sesuatu
dari `pages/`, berarti ada yang salah tempat.

---

## Alias `@`

`@` menunjuk ke folder `src/`, didaftarkan di dua tempat:

- `vite.config.js` — supaya Vite bisa me-resolve saat dev & build
- `jsconfig.json` — supaya VS Code bisa autocomplete dan Ctrl+Click

```js
// sebelum
import { ROUTES } from "../../../constants/routes";

// sesudah
import { ROUTES } from "@/constants";
```

Aturannya: **selalu pakai `@/`**, kecuali untuk file bertetangga di folder yang
sama (contoh `import FoodCard from "./FoodCard"` di dalam `components/`).

---

## Peta Route

Didefinisikan di `src/router.jsx`. Path-nya diambil dari `ROUTES` di
`src/constants.js` — jangan tulis string path langsung di komponen.

```
AuthLayout
├── /login                          AuthPage mode="login"
└── /register                       AuthPage mode="register"

MainLayout
├── /                               LandingPage                 publik
├── ProtectedRoute                                              butuh token
│   ├── /home                       HomePage
│   ├── /foods                      FoodPage
│   ├── /foods/:foodId              FoodDetailPage
│   ├── /favorites                  PlaceholderPage
│   ├── /cart                       CartPage
│   ├── /checkout                   CartPage
│   ├── /transactions               PlaceholderPage
│   ├── /transactions/:id           PlaceholderPage
│   ├── /profile                    PlaceholderPage
│   └── AdminRoute                                              butuh role admin
│       └── /admin  (AdminLayout)
│           ├── (index)             PlaceholderPage
│           ├── foods
│           ├── foods/create
│           ├── foods/:foodId/edit
│           ├── users
│           └── transactions
├── /unauthorized                   UnauthorizedPage
└── *                               NotFoundPage
```

`ProtectedRoute` mengecek token di localStorage dan menyimpan halaman asal di
`location.state.from`, jadi setelah login user kembali ke tempat semula.
`AdminRoute` mengecek `user.role === ROLES.ADMIN`.

---

## Cara Menambah Fitur Baru

Contoh: menyambungkan halaman daftar transaksi ke API.

1. **Endpoint** — cek `src/api/endpoints.js`, grup `TRANSACTIONS` sudah tersedia.
2. **Fungsi API** — buat `src/api/transactions.js`:

   ```js
   import apiClient from "@/api/client";
   import { ENDPOINTS } from "@/api/endpoints";

   export async function getMyTransactions() {
     const response = await apiClient.get(ENDPOINTS.TRANSACTIONS.MY_TRANSACTIONS);
     return response.data;
   }
   ```

3. **Hook** — buat `src/hooks/useTransactions.js` yang memanggil fungsi di atas
   dan mengembalikan `{ data, loading, error }`. Ikuti pola `useFoods`.
4. **Halaman** — buat `src/pages/TransactionPage.jsx`, lalu ganti
   `PlaceholderPage` untuk route `/transactions` di `src/router.jsx`.
5. **Komponen** — kalau ada bagian UI yang dipakai lebih dari satu halaman,
   pindahkan ke `src/components/`.

Token dan `apiKey` sudah otomatis ditempel oleh interceptor di `api/client.js`,
jadi tidak perlu diurus lagi di tiap fungsi API.

---

## Catatan Migrasi

Ringkasan perubahan dari struktur lama (39 file, folder `features/` bertingkat):

| Lama | Baru |
|---|---|
| `src/app/router.jsx` | `src/router.jsx` |
| `src/constants/routes.js` + `src/constants/roles.js` | `src/constants.js` |
| `src/services/apiClient.js` | `src/api/client.js` |
| `src/services/endpoints.js` | `src/api/endpoints.js` |
| `src/features/auth/services/authApi.js` | `src/api/auth.js` |
| `src/features/auth/utils/authStorage.js` | `src/lib/authStorage.js` |
| `src/features/auth/components/AuthForm.jsx` + `LoginPage` + `RegisterPage` | `src/pages/AuthPage.jsx` |
| `src/features/foods/services/foodApi.js` | `src/api/foods.js` |
| `src/features/foods/hooks/useFoods.js` + `useFoodDetail.js` | `src/hooks/useFoods.js` |
| `src/features/foods/components/*` | `src/components/` |
| `src/features/*/pages/*` + `src/pages/*` | `src/pages/` |
| `src/features/foods/constants/demoFoods.js` | `src/data/demoFoods.js` + `src/lib/format.js` |
| `src/routes/ProtectedRoute.jsx` + `AdminRoute.jsx` | `src/layouts/RouteGuard.jsx` |
| `src/components/layout/*` | `src/layouts/` |
| `src/styles/index.css` | `src/index.css` |

Dihapus karena tidak pernah di-import: `src/App.jsx`, `src/App.css`,
`src/index.css` lama, dan seluruh isi `src/assets/`.
