import { ClientBytecode } from "../interfaces";

export const composeInput = (
  clientBytecode: ClientBytecode,
  args: number[],
): string => {
  const key = BigInt(clientBytecode.key);
  const nargs = clientBytecode.nargs;

  let bytecode = clientBytecode.bytecode;

  if (nargs !== args.length) {
    throw new Error(
      "The number of arguments does not match the required number of arguments of the client bytecode.",
    );
  }

  let packedHex = bytecode.replace(/[\da-f]{2}/gi, (byte) =>
    (parseInt(byte, 16) ^ 0xff).toString(16).padStart(2, "0"),
  );

  for (let i = 0; i < nargs; i++) {
    const lookup = (key + BigInt(i)).toString(16).padStart(64, "0");
    const replacement = BigInt(args[i]).toString(16).padStart(64, "0");

    if (packedHex.includes(lookup)) {
      packedHex = packedHex.replace(lookup, replacement);
      bytecode = packedHex.replace(/[\da-f]{2}/gi, (byte) =>
        (parseInt(byte, 16) ^ 0xff).toString(16).padStart(2, "0"),
      );
    } else {
      throw new Error("Failed to adjust the bytecode.");
    }
  }

  return `0x${bytecode}`;
};
