package com.woonam.chiper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Base64;

@WebServlet(urlPatterns = {"/ChiperTest.do"})
public class TestController extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        req.setCharacterEncoding("utf-8");
        resp.setCharacterEncoding("utf-8");

        PrintWriter out			= resp.getWriter();

        String ori = req.getParameter("DATA");

        try {
            ARIAChiper chiper = new ARIAChiper();
            String value = chiper.EncryptToString(ori);

            byte[] b =  chiper.ARIA_Encode(ori.getBytes("UTF8"));

            value += ";" + new String(b);
            value += ";" + Base64.getEncoder().encodeToString(ori.getBytes("UTF8"));

            out.print(value);
        }
        catch (Exception e) {
            out.print("Exception");

        }
    }
}
