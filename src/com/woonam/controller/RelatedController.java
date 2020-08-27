package com.woonam.controller;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.woonam.connect.AgentConnect;
import com.woonam.model.GetModel;
import com.woonam.model.SetModel;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@WebServlet(urlPatterns = {"/RelatedCommand.do"})
public class RelatedController extends HttpServlet{

	private static final long serialVersionUID = 1L;
	private Common m_C 					= null;
	private String m_RootPath 				= null;
//	private boolean isInitCompleted 		= false;
	private GetModel m_GM					= null;
	private SetModel m_SM					= null;
	private AgentConnect m_AC			= null;
	private Logger logger = null;

	enum ENUM_COMMAND {
		ADD_DOC,
		GET_ORG_LIST,
		GET_DOC_LIST
	}

	public RelatedController() {
		this.logger					= LogManager.getLogger(RelatedController.class);
		this.m_C 					= new Common();
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		req.setCharacterEncoding("utf-8");
		resp.setCharacterEncoding("utf-8");
		
		this.m_RootPath			= m_C.getRootPath(getServletContext());
		Profile profile				= new Profile(m_RootPath + File.separator +"conf" + File.separator + "conf.ini");

		//Check logger init result.
//		if(!m_C.setLogger(profile, this.m_RootPath))
//		{
//			RequestDispatcher rd = req.getRequestDispatcher("slip_error.jsp?ERR_MSG=FAILED_LOGGER_INIT");
//	  	 	rd.forward(req,resp);
//	  	 	return;
//		}
		
		PrintWriter out			= resp.getWriter();
		
		Map mapParams = new HashMap<String, String[]>(req.getParameterMap());
		String strClientIP = m_C.getClientIP(profile, req);
		String[] arClientIP = {strClientIP};
		mapParams.put("ClientIP", arClientIP);
		
		HttpSession session			= req.getSession();
		String strCommand			= m_C.getParamValue(mapParams, "Command", null);
		
		if(m_C.isBlank(strCommand))
		{
    		logger.error("Command is null");
    		out.print(m_C.writeResultMsg("F", "COMMAND_IS_NULL"));
			return;
		}
    	
  	   	if(m_C.IsInjection(mapParams))
	   	{
	 		logger.error("Injection detected.");
    		out.print(m_C.writeResultMsg("F", "INJECTION_DETECTED"));
			return;
	   	}
		/*
		 * Logger.write("----------------------------------------", 5);
		 * Logger.write("ViewerCommand : Command - "+strCommand, 5);
		 */
		
		ENUM_COMMAND EC = null;
		try
		{	
			this.m_AC 	= new AgentConnect(profile);
			this.m_GM 	= new GetModel(m_AC, session);
			this.m_SM 	= new SetModel(m_AC, session);
			EC 	= ENUM_COMMAND.valueOf(strCommand);
			
			switch(EC)
			{
			case GET_ORG_LIST : {
				String[] arrParam = {"URL"};
				if(m_C.IsNullParam(arrParam, mapParams))
				{
					logger.error("Parameter of "+strCommand+" is NULL.");
					out.print(m_C.writeResultMsg("F", "PARAMETER_IS_NULL"));
					return;
				}
				if(!m_C.chk_UserPermission(m_GM, session))
				{
					logger.error("Permission denied.");
					out.print(m_C.writeResultMsg("F", "PERMISSION_DENIED"));
					return;
				}

//				URL url;
				InputStream is = null;
				BufferedReader br;
				String line;
				StringBuffer sbRes = new StringBuffer();
				String urlVal = m_C.getParamValue(mapParams,"URL","");
				urlVal = urlVal.replaceAll("＆","&");
				String strCharSet = profile.getString("INTERFACE", "CHARSET", "utf-8");

				try {
					urlVal += "?tmp=" + m_C.getToday("yyyyMMddHHmmssSSS");
					logger.debug(urlVal);
//
					HttpURLConnection con = (HttpURLConnection) (new URL(urlVal).openConnection());
					con.setInstanceFollowRedirects(false);
					con.setRequestProperty("Cookie",
							"LtpaToken="+session.getAttribute("TOKEN")+"; " +
							"domain="+ profile.getString("INTERFACE","MAIN_URL","") + "; " +
							"path=/");

					con.connect();

					logger.debug("ResponseCode: " + con.getResponseCode());

					is = con.getInputStream();  // throws an IOException
					br = new BufferedReader(new InputStreamReader(is, strCharSet));
//
					while ((line = br.readLine()) != null) {
						sbRes.append(line);
					}
					logger.debug(sbRes.toString());
				}  catch (Exception ioe) {
					logger.error(ioe);
					sbRes = null;
				} finally {
					try {
						if (is != null) is.close();
					} catch (IOException ioe) {
						// nothing to see here
						sbRes = null;
					}
				}

				if(m_C.isBlank(sbRes.toString())) {
					out.print(m_C.writeResultMsg("F", ""));
				}
				else {
					out.print(m_C.writeResultMsg("T", sbRes.toString()));
				}
				break;

			}
			case GET_DOC_LIST : {
				String[] arrParam = {"URL"};
				if(m_C.IsNullParam(arrParam, mapParams))
				{
					logger.error("Parameter of "+strCommand+" is NULL.");
					out.print(m_C.writeResultMsg("F", "PARAMETER_IS_NULL"));
					return;
				}
				if(!m_C.chk_UserPermission(m_GM, session))
				{
					logger.error("Permission denied.");
					out.print(m_C.writeResultMsg("F", "PERMISSION_DENIED"));
					return;
				}

//				URL url;
				InputStream is = null;
				BufferedReader br;
				String line;
				StringBuffer sbRes = new StringBuffer();
				String urlVal = m_C.getParamValue(mapParams,"URL","");
				urlVal = urlVal.replaceAll("＆","&");
				String strCharSet = profile.getString("INTERFACE", "CHARSET", "utf-8");

				try {
//					urlVal += "?tmp=" + m_C.getToday("yyyyMMddHHmmssSSS");
					logger.debug(urlVal);
//
					HttpURLConnection con = (HttpURLConnection) (new URL(urlVal).openConnection());
					con.setInstanceFollowRedirects(false);
					con.setRequestProperty("Cookie",
							"LtpaToken="+session.getAttribute("TOKEN")+"; " +
									"domain="+ profile.getString("INTERFACE","MAIN_URL","") + "; " +
									"path=/");

					con.connect();

					logger.debug("ResponseCode: " + con.getResponseCode());

					is = con.getInputStream();  // throws an IOException
					br = new BufferedReader(new InputStreamReader(is, strCharSet));
//
					while ((line = br.readLine()) != null) {
						sbRes.append(line);
					}
					logger.debug(sbRes.toString());
				}  catch (Exception ioe) {
					logger.error(ioe);
					sbRes = null;
				} finally {
					try {
						if (is != null) is.close();
					} catch (IOException ioe) {
						// nothing to see here
						sbRes = null;
					}
				}

				if(m_C.isBlank(sbRes.toString())) {
					out.print(m_C.writeResultMsg("F", ""));
				}
				else {
					out.print(m_C.writeResultMsg("T", sbRes.toString()));
				}
				break;

			}
			case ADD_DOC : {
				String[] arrParam = {"DOC_INFO","JDOC_NO"};
				if(m_C.IsNullParam(arrParam, mapParams))
				{
					logger.error("Parameter of "+strCommand+" is NULL.");
					out.print(m_C.writeResultMsg("F", "PARAMETER_IS_NULL"));
					return;
				}

				if(!m_C.chk_UserPermission(m_GM, session))
				{
					logger.error("Permission denied.");
					out.print(m_C.writeResultMsg("F", "PERMISSION_DENIED"));
					return;
				}

				Boolean bRes = m_SM.addDocURL(mapParams);
				if(bRes)
				{
					out.print(m_C.writeResultMsg("T", ""));
				}
				else
				{
					out.print(m_C.writeResultMsg("F", "FAILED_UPLOAD_ADDFILE"));
				}
				break;
			}

			default :
			{
				out.print(m_C.writeResultMsg("F", "COMMAND_IS_NULL"));
				break;
			}
			}

		}
		catch (Exception e) {
			out.print(m_C.writeResultMsg("F", "SERVER_EXCEPTION"));
		}
		
		return;
	}






}
