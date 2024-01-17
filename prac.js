import { random } from "./test.js";
import http from "http"
const server= http.createServer((req,res)=>{
    res.setHeader("Content-Type", "text/html");
    console.log(req.method)
    if(req.url==="/about"){
        res.end(`<p>I Love you ${random()}</p>`);
    }
    else if(req.url==="/info"){
        res.end("<p> Its a info page </p>");
    }
    else if(req.url==="/"){
        res.end("<p>Home Page</p>");
    }
    else{
        res.end("<p>Page not found</p>");
    }
});
server.listen(5001,()=>{
    console.log("success");
});