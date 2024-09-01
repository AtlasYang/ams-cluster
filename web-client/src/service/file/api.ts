import { AxiosInstance } from "axios";

export class FileService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async uploadFile({ file }: { file: File }) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await this.instance.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.url as string;
  }
}
