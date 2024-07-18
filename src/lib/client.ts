import fetch from "cross-fetch";
import { ClientBytecode } from "../interfaces";

export class Client {
  private static _API_URL = "https://users.chainsatlas.com";
  private _apiKey: string;

  constructor(apiKey: string) {
    this._apiKey = apiKey;
  }

  public async compile(
    code: string,
    language: "c",
    nargs: number,
  ): Promise<ClientBytecode> {
    const response = await fetch(
      `${Client._API_URL}/compiler/${this._apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language, nargs }),
      },
    );
    if (!response.ok) {
      console.error(response);
      throw new Error(
        `HTTP error! [${response.status}]: ${response.statusText}`,
      );
    }

    const clientBytecode = await response.json();

    return clientBytecode;
  }
}
