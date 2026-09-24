import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// Mengirim satu file gambar dan mengembalikan URL publiknya.
// Nama field WAJIB "image". Axios mengisi header multipart sendiri
// saat body-nya FormData, jadi Content-Type tidak perlu ditulis.
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.post(ENDPOINTS.UPLOAD.IMAGE, formData);
  // Beda dari endpoint lain: URL-nya ada di response.data.url,
  // bukan di response.data.data.
  return response.data.url;
}
