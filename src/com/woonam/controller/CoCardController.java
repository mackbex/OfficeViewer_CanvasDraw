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
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@WebServlet(urlPatterns = {"/CoCardCommand.do"})
public class CoCardController extends HttpServlet{

	private static final long serialVersionUID = 1L;
	private Common m_C 					= null;
	private String m_RootPath 				= null;
//	private boolean isInitCompleted 		= false;
	private GetModel m_GM					= null;
	private SetModel m_SM					= null;
	private AgentConnect m_AC			= null;
	private Logger logger = null;

	enum ENUM_COMMAND {

		GET_COCARD_LIST,
		UPDATE_COCARD_APPR,
		REMOVE_SELECTED_SLIP,
		GET_SLIP_LIST

	}

	public CoCardController() {
		this.logger					= LogManager.getLogger(CoCardController.class);
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

		Map mapParams = new HashMap<String, Object>(req.getParameterMap());
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
			case GET_COCARD_LIST : {
//				String[] arrParam = {"FROM_DATE", "TO_DATE"};
//				if(m_C.IsNullParam(arrParam, mapParams))
//				{
//					logger.error("Parameter of "+strCommand+" is NULL.");
//					out.print(m_C.writeResultMsg("F", "PARAMETER_IS_NULL"));
//					return;
//				}

				JsonObject objRes = m_GM.getCocardList(mapParams);
				if(objRes == null)
				{
					out.print(m_C.writeResultMsg("F", "Failed to run. Command : " + EC.name()));
				}
				else
				{
					out.print(objRes.toString());
				}
				break;
			}
			case UPDATE_COCARD_APPR : {
				String[] arrParam = {"APPR_CARD", "SDOC_NO"};
				if(m_C.IsNullParam(arrParam, mapParams))
				{
					logger.error("Parameter of "+strCommand+" is NULL.");
					out.print(m_C.writeResultMsg("F", "PARAMETER_IS_NULL"));
					return;
				}

				String apprNo		= m_C.getParamValue(mapParams, "APPR_CARD", "");

				if(m_C.isBlank(apprNo) && apprNo.length() != 8) {
					out.print(m_C.writeResultMsg("F", "INPUT_8_DIGITED_APPR_NO"));
				}

				if(m_SM.updateCoCardAppr(mapParams)) {
					out.print(m_C.writeResultMsg("T", ""));
				}
				else {
					out.print(m_C.writeResultMsg("F", "FAILED_UPDATE_COCARD_APPR"));
				}
				break;
			}
			case GET_SLIP_LIST : {
				String[] arrParam = {"KEY"};
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

				JsonObject objRes = m_GM.getCoCardSlipList(mapParams);
				if(objRes == null)
				{
					out.print(m_C.writeResultMsg("F", "Failed to run. Command : " + EC.name()));
				}
				else
				{
					String useBookMark = profile.getString("WAS_INFO", "USE_BOOKMARK", "F");

					if("T".equalsIgnoreCase(useBookMark)) {
						Iterator<String> keys = objRes.keySet().iterator();
						while(keys.hasNext()) {
							JsonObject item = objRes.get(keys.next()).getAsJsonObject();
							String sdocNo 	= item.get("SDOC_NO").getAsString();
							String slipIrn 	= item.get("SLIP_IRN").getAsString();
							item.add("BOOKMARKS",m_GM.Get_BookmarkList(sdocNo, slipIrn));
						}
					}
					out.print(objRes.toString());
				}
				break;
			}
			case REMOVE_SELECTED_SLIP : {

				String[] arrParam = {"VIEW_MODE", "FIELD","VALUE"};
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

				String viewMode = m_C.getParamValue(mapParams, "VIEW_MODE", "");
				JsonArray ar_item = m_GM.Get_SlipInfo(mapParams);
				for(int i = 0; i < ar_item.size(); i++) {
					JsonObject obj_item = ar_item.get(i).getAsJsonObject();
					if("1".equalsIgnoreCase(obj_item.get("SDOC_SYSTEM").getAsString())) {
						out.print(m_C.writeResultMsg("F", "SYSTEM_SLIP_CANNOT_BE_REMOVED"));
						return;
					}

					if("AFTER".equalsIgnoreCase(viewMode)) {
						if("0".equalsIgnoreCase(obj_item.get("SDOC_AFTER").getAsString())) {
							out.print(m_C.writeResultMsg("F", "CANNOT_REMOVE_IN_AFTER_MODE"));
							return;
						}
					}
				}

				int nResCnt = m_SM.removeSlip(mapParams);
				if(nResCnt > -1)
				{
					out.print(m_C.writeResultMsg("T", nResCnt+""));
				}
				else
				{
					out.print(m_C.writeResultMsg("F", "Failed to run. Command : " + EC.name()));
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
