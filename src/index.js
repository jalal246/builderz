import { error } from "@mytools/print";
import start from "./rollup.config";

start().catch(err => {
  error(err);
});
