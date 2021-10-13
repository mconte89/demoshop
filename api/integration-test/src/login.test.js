import "@babel/polyfill";
import fetch from "node-fetch";

function toFormData(obj) {
    const data = [];
    for (let k in obj) {
        let key = encodeURIComponent(k);
        let value = encodeURIComponent(obj[k]);
        data.push(`${key}=${value}`);
    }
    return data.join("&");
}

const user = "test-user-" + new Date().getTime();
let activationCode;

test("register", async (done) => {
    const formData = toFormData({
        name: user,
        mail: user + "@applica.guru",
        password: "applica"
    });

    console.log(formData);

    const result = await fetch(
        "http://localhost:8080/account/register",
        {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"},
            body: formData
        }
    );
    const response = await result.json();
    
    expect(response.responseCode).toBe(0);

    activationCode = response.value;
 
    done();
 });
/*
 test("confirm", async (done) => {
    const result = await fetch(
        "http://localhost:8080/account/confirm",
        {
            method: "POST",
            body: toFormData({
                activationCode: activationCode
            })
        }
    );
    const response = await result.json();
    
    expect(response.responseCode).toBe(0);

    activationCode = response.value;
 
    done();
 });

test("login", async (done) => {
   const result = await fetch(
       "http://localhost:8080/auth/login",
        {
            method: "POST",
            body: toFormData({
                mail: user + "@applica.guru",
                password: "applica"
            })
        }
    );
    const response = await result.json();
    expect(response.responseCode).toBe(0);

   done();
});

*/