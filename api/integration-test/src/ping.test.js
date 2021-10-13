import "@babel/polyfill";
import fetch from "node-fetch";

test("ping", async (done) => {
   const response = await fetch("http://localhost:8080/ping");
   const result = await response.text();
   expect(result).toBe("OK");

   done();
});

