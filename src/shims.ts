import * as process from "process";
import { Buffer } from "buffer";
Object.assign(self, {
  process,
  global: self,
  Buffer,
});
