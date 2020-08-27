package com.woonam.model;

import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.woonam.connect.AgentConnect;
import com.woonam.constants.Queries;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import com.woonam.wdms.PreparedStatement;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class GetModel {

	private AgentConnect m_AC 		= null;
	private Profile m_Profile				= null;
	private Common m_C				 	= null;
	private HttpSession session		= null;
	private Logger logger = null;
	
	public GetModel(AgentConnect AC, HttpSession session)
	{
		this.logger 	= LogManager.getLogger(GetModel.class);
		this.m_AC 		= AC;
		this.m_Profile 	= AC.getProfile();
		this.m_C 		= new Common();
		this.session 	= session;
	}
	
	public GetModel(AgentConnect AC)
	{
		this.logger 	= LogManager.getLogger(GetModel.class);
		this.m_AC 		= AC;
		this.m_Profile 	= AC.getProfile();
		this.m_C 		= new Common();
		this.session 	= null;
	}
	
	
	public JsonObject getUserInfo(String strUserID, String strCoCD, String strLang)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null) { logger.error("GetUserInfo  : WdmDB is NULL."); return null; }
		//Get current function name
		JsonObject objRes 	= null;

		if(m_C.isBlank(strLang)) strLang = "ko";
//		StringBuffer sbQuery = new StringBuffer();
//		sbQuery.append();
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_USER_INFO);
			pStmt.setString(0, strUserID);
			pStmt.setString(1, strCoCD);
			pStmt.setString(2, strLang);
			
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
			
			while(m_AC.next()) 
			{
				objRes = m_AC.Get_itemObj(objRes, m_AC.Get_CurIndex());
				objRes.addProperty("USER_ID", strUserID);
				
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
		
		return objRes;
	}
	
	
	public JsonObject getOriginalInfo(Map<String, Object> mapParams) {
		
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject obj_Res 			= new JsonObject();
		
		if (m_AC == null)	return null;
		
		String orgIRN				= m_C.getParamValue(mapParams, "ORG_IRN", null);
	
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_ORIGINAL_INFO);
			pStmt.setString(0, orgIRN);
					
			m_AC.GetData(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				obj_Res.addProperty("DOC_IRN", m_AC.GetString("DOC_IRN"));
				obj_Res.addProperty("ORG_FILE", m_AC.GetString("ORG_FILE"));
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
			return null;
		}
    	
    	return obj_Res;
	}

	public String getSDocNo(String key) {

		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		String res = null;

		if (m_AC == null)	return null;


		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_SDOC_NO);
			pStmt.setString(0, key);

			m_AC.GetData(pStmt.getQuery(), strFuncName);

			while(m_AC.next())
			{
				res = m_AC.GetString("SDOC_NO");
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
			return null;
		}

		return res;
	}
	
	public String getAttachFileName(Map<String, Object> mapParams) {
		
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		String strRes 			= null;
		
		if (m_AC == null)	return null;
		
		String docIRN				= m_C.getParamValue(mapParams, "DOC_IRN", null);
	
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_ADDFILE_NAME);
			pStmt.setString(0, docIRN);
					
			m_AC.GetData(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				strRes = m_AC.GetString("FILE_NAME");
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return strRes;
	}
	
	public JsonArray Get_SlipCnt(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray ar_res = new JsonArray();
		
		if (m_AC == null)	return null;
		//Get current function name
		
		String type			= m_C.getParamValue(mapParams, "TYPE", null);
		String[] arKey				= m_C.getParamValue(mapParams, "KEY");
		String kind				= m_C.getParamValue(mapParams, "KIND", null);
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_API_SLIP_CNT);
			pStmt.setProcArray(0, new ArrayList<Object>(Arrays.asList(arKey)));
			pStmt.setString(1, type);
			pStmt.setString(2, kind);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_item = new JsonObject();
				obj_item.addProperty(m_AC.GetString("JDOC_NO"), m_AC.GetString("CNT"));
				ar_res.add(obj_item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return ar_res;
	}
	
	public JsonArray Get_RecycleTargetList()
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObj_Res = new JsonArray();
		
		if (m_AC == null)	return null;
		//Get current function name
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_RECYCLE_LIST);
			m_AC.GetData(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				arObj_Res.add(obj_Item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return arObj_Res;
	}
	
	public JsonArray Get_SlipInfo(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObj_Res = new JsonArray();
		
		if (m_AC == null)	return null;
		//Get current function name
		
		String[] arValue				= m_C.getParamValue(mapParams, "VALUE");
		String lang			= m_C.getParamValue(mapParams, "LANG", "KO");
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_SLIP_LIST);
			pStmt.setProcArray(0, new ArrayList<Object>(Arrays.asList(arValue)));
			pStmt.setString(1, "SDOC_NO");
			pStmt.setString(2, lang);
			pStmt.setNull(3);
			pStmt.setNull(4);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				arObj_Res.add(obj_Item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return arObj_Res;
	}
	

	public int Verify_SlipCnt(JsonArray ar_data)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int res = -1;
		
		if (m_AC == null)	return -1;
		//Get current function name
		
		ArrayList list 	= new ArrayList<Object>();
		
		for(int i = 0; i < ar_data.size(); i++) {
			list.add(ar_data.get(i).getAsJsonObject().get("DOC_IRN").getAsString());
		}
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.VERIFY_SLIP_CNT);
			pStmt.setArray(0, list);
			m_AC.GetData(pStmt.getQuery(), strFuncName);
			 
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				res = Integer.parseInt(m_AC.GetString("CNT"));
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return res;
	}
	
	public int Get_SlipdocIndex(String key) {
		
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int res = 10;
		
		if (m_AC == null)	return 10;
		//Get current function name
		
		ArrayList list 	= new ArrayList<Object>();
	
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_JDOCNO_INDEX);
			pStmt.setString(0, key);
			m_AC.GetData(pStmt.getQuery(), strFuncName);
			 
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				try {
					res = Integer.parseInt(m_AC.GetString("JDOC_INDEX"));
				}
				catch(Exception e) {
					res = 10;
				}
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return res;
	}
	
	public int Verify_ThumbCnt(JsonArray ar_data)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int res = -1;
		
		if (m_AC == null)	return -1;
		//Get current function name
		
		ArrayList list 	= new ArrayList<Object>();
		
		for(int i = 0; i < ar_data.size(); i++) {
			list.add(ar_data.get(i).getAsJsonObject().get("DOC_IRN").getAsString());
		}
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.VERIFY_THUMB_CNT);
			pStmt.setArray(0, list);
			m_AC.GetData(pStmt.getQuery(), strFuncName);
			 
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				res = Integer.parseInt(m_AC.GetString("CNT"));
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return res;
	}
	

	public JsonArray Get_AttachInfo(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObj_Res = new JsonArray();
		
		if (m_AC == null)	return null;
		//Get current function name
		
		String[] arValue				= m_C.getParamValue(mapParams, "VALUE");
		String lang			= m_C.getParamValue(mapParams, "LANG", "KO");
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_ATTACH_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(arValue)));
			pStmt.setString(1, "SDOC_NO");
			pStmt.setString(2, lang);
			pStmt.setNull(3);
			pStmt.setNull(4);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				arObj_Res.add(obj_Item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return arObj_Res;
	}
	
	public JsonArray Get_SlipList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObj_Res = new JsonArray();
		
		if (m_AC == null)	return null;
		//Get current function name
		
		String type			= m_C.getParamValue(mapParams, "TYPE", null);
		String[] arKey				= m_C.getParamValue(mapParams, "KEY");
		String kind				= m_C.getParamValue(mapParams, "KIND", null);
		String lang			= m_C.getParamValue(mapParams, "LANG", "KO");
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_API_SLIP_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(arKey)));
			pStmt.setString(1, type);
			pStmt.setString(2, kind);
			pStmt.setString(3, lang);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				arObj_Res.add(obj_Item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return arObj_Res;
	}
	
	public JsonArray Get_CardData(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObj_Res = new JsonArray();
		
		if (m_AC == null)	return null;
		//Get current function name
		
		String type			= m_C.getParamValue(mapParams, "TYPE", null);
		String[] arKey				= m_C.getParamValue(mapParams, "KEY");
		String kind				= m_C.getParamValue(mapParams, "KIND", null);
		String lang			= m_C.getParamValue(mapParams, "LANG", "KO");
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_API_SLIP_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(arKey)));
			pStmt.setString(1, type);
			pStmt.setString(2, kind);
			pStmt.setString(3, lang);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				arObj_Res.add(obj_Item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return arObj_Res;
	}
	
	public JsonObject Get_cardConverList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject obj_res = new JsonObject();
		//JsonObject objRes = new JsonObject();
		
		if (m_AC == null)	return null;
		
		String[] strApprNo	= m_C.getParamValue(mapParams, "APPR_NO");
		String strPTIstat	= m_C.getParamValue(mapParams, "PTI_STATUS", null);
		String strDate		= m_C.getParamValue(mapParams, "USED_DATE", null);
		String strCnt		= m_C.getParamValue(mapParams, "ROW_CNT", "1");
		String strRes		= m_C.getParamValue(mapParams, "RESULT", "T");
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_CARD_CONVERT_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(strApprNo)));
			pStmt.setString(1, strPTIstat);
			pStmt.setString(2, strDate);
			pStmt.setString(3, strCnt);
			pStmt.setString(4, strRes);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				
				//String strResPTIStat			=	m_AC.GetString("PTI_STATUS");
				//objRes.addProperty("PTI_STATUS", strResPTIStat);
				obj_res = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
//				if("00".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString()) || "01".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString())) {
//					obj_Item.addProperty("PTI_STATUS", "10");
//				}
				
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return obj_res;
	}

	public JsonObject Get_cashConverList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject obj_res = new JsonObject();
		//JsonObject objRes = new JsonObject();

		if (m_AC == null)	return null;

		String[] strApprNo	= m_C.getParamValue(mapParams, "APPR_NO");
		String strPTIstat	= m_C.getParamValue(mapParams, "PTI_STATUS", null);
		String strDate		= m_C.getParamValue(mapParams, "USED_DATE", null);
		String strCnt		= m_C.getParamValue(mapParams, "ROW_CNT", "1");
		String strRes		= m_C.getParamValue(mapParams, "RESULT", "T");

		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_CASH_CONVERT_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(strApprNo)));
			pStmt.setString(1, strPTIstat);
			pStmt.setString(2, strDate);
			pStmt.setString(3, strCnt);
			pStmt.setString(4, strRes);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);

			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();

				//String strResPTIStat			=	m_AC.GetString("PTI_STATUS");
				//objRes.addProperty("PTI_STATUS", strResPTIStat);
				obj_res = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
//				if("00".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString()) || "01".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString())) {
//					obj_Item.addProperty("PTI_STATUS", "10");
//				}

			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return obj_res;
	}
	
	public JsonArray Get_reportConverList(Map<String, Object> mapParams) throws Exception
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray ar_res = new JsonArray();
		//JsonObject objRes = new JsonObject();
		
		if (m_AC == null)	return null;
		
		String strType		= m_C.getParamValue(mapParams, "TYPE","");
		String strApprNo	= m_C.getParamValue(mapParams, "APPR_NO","");
		String strPTIstat	= m_C.getParamValue(mapParams, "PTI_STATUS", null);
		String strDate		= m_C.getParamValue(mapParams, "USED_DATE", null);
		String strCnt		= m_C.getParamValue(mapParams, "ROW_CNT", "");
		String strRes		= m_C.getParamValue(mapParams, "RESULT", "T");
		
		strApprNo = URLDecoder.decode(strApprNo, m_Profile.getString("AGENT_INFO", "CHARSET", ""));
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_REPORT_CONVERT_LIST);
			pStmt.setString(0, strType);
			pStmt.setString(1, strApprNo);
			pStmt.setString(2, strPTIstat);
			pStmt.setString(3, strDate);
			pStmt.setString(4, strCnt);
			pStmt.setString(5, strRes);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				
				//String strResPTIStat			=	m_AC.GetString("PTI_STATUS");
				//objRes.addProperty("PTI_STATUS", strResPTIStat);
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				ar_res.add(obj_Item);
//				if("00".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString()) || "01".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString())) {
//					obj_Item.addProperty("PTI_STATUS", "10");
//				}
				
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return ar_res;
	}
	
	public JsonObject Get_orderConverList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject obj_res = new JsonObject();
		//JsonObject objRes = new JsonObject();
		
		if (m_AC == null)	return null;
		
		String[] strApprNo	= m_C.getParamValue(mapParams, "APPR_NO");
		String strPTIstat	= m_C.getParamValue(mapParams, "PTI_STATUS", null);
		String strDate		= m_C.getParamValue(mapParams, "USED_DATE", null);
		String strCnt		= m_C.getParamValue(mapParams, "ROW_CNT", "1");
		String strRes		= m_C.getParamValue(mapParams, "RESULT", "T");
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_ORDER_CONVERT_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(strApprNo)));
			pStmt.setString(1, strPTIstat);
			pStmt.setString(2, strDate);
			pStmt.setString(3, strCnt);
			pStmt.setString(4, strRes);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				
				//String strResPTIStat			=	m_AC.GetString("PTI_STATUS");
				//objRes.addProperty("PTI_STATUS", strResPTIStat);
				obj_res = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
//				if("00".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString()) || "01".equalsIgnoreCase(obj_Item.get("PTI_STATUS").toString())) {
//					obj_Item.addProperty("PTI_STATUS", "10");
//				}
				
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return obj_res;
	}
	
	public JsonObject Get_taxConverList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject obj_Res = new JsonObject();
		//JsonObject objRes = new JsonObject();
		
		if (m_AC == null)	return null;
		
		String[] strApprNo	= m_C.getParamValue(mapParams, "ISSUE_ID");
		String strPTIstat		= m_C.getParamValue(mapParams, "PTI_STATUS", null);
		String strDate			= m_C.getParamValue(mapParams, "USED_DATE", null);
		String type				= m_C.getParamValue(mapParams, "TAX_TYPE", null);
		String strCnt			= m_C.getParamValue(mapParams, "ROW_CNT", "1");
		String strRes			= m_C.getParamValue(mapParams, "RESULT", "T");
		
		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_TAX_CONVERT_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(strApprNo)));
			pStmt.setString(1, strPTIstat);
			pStmt.setString(2, strDate);
			pStmt.setString(3, type);
			pStmt.setString(4, strCnt);
			pStmt.setString(5, strRes);
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				
				//String strResPTIStat			=	m_AC.GetString("PTI_STATUS");
				//objRes.addProperty("PTI_STATUS", strResPTIStat);
				obj_Res = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				//obj_Item.addProperty("PTI_STATUS", "10");
				
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return obj_Res;
	}
	

	public JsonArray Get_taxItemConverList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObj_Res = new JsonArray();
		
		if (m_AC == null)	return null;
		
		//String[] strApprNo	= m_C.getParamValue(mapParams, "ITEM_KEY");
		String[] strItemKey			= m_C.getParamValue(mapParams, "ITEM_KEY");
		try {
			
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_TAXITEM_CONVERT_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(strItemKey)));
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				arObj_Res.add(obj_Item);
			}
			
		} catch (Exception e) {
			logger.error(strFuncName, e);
		}
		
		return arObj_Res;
	}
	
	public JsonArray Get_orderItemConverList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObj_Res = new JsonArray();
		
		if (m_AC == null)	return null;
		
		//String[] strApprNo	= m_C.getParamValue(mapParams, "ITEM_KEY");
		String[] strItemKey			= m_C.getParamValue(mapParams, "ITEM_KEY");
		try {
			
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_ORDERITEM_CONVERT_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(strItemKey)));
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
				
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				arObj_Res.add(obj_Item);
			}
			
		} catch (Exception e) {
			logger.error(strFuncName, e);
		}
		
		return arObj_Res;
	}
	
//	public JsonObject getAttachCount(Map<String, Object> mapParams)
//	{
//		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
//		JsonObject objRes = new JsonObject();
//		objRes.addProperty("ATTACH_CNT","0");
//
//		if (m_AC == null)	return null;
//		//Get current function name
//
//		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
//		String strSDocNo			= m_C.getParamValue(mapParams, "SDOC_NO", null);
//		String[] arKey				= m_C.getParamValue(mapParams, "KEY");
//		String strCoCD				= m_C.getParamValue(mapParams, "CORP_NO", null);
//		String keyType				= m_C.getParamValue(mapParams, "KEY_TYPE", "JDOC_NO");
//
//		try
//		{
//			PreparedStatement pStmt = new PreparedStatement(Queries.GET_ATTACH_COUNT);
//			pStmt.setColumnName(0, keyType);
//			pStmt.setArray(1, new ArrayList<Object>(Arrays.asList(arKey)));
//
//			m_AC.GetData(pStmt.getQuery(), strFuncName);
//
//			while(m_AC.next())
//			{
//				objRes.addProperty("ATTACH_CNT", m_AC.GetString("ATTACH_CNT"));
//			}
//		}
//		catch(Exception e)
//		{
//			logger.error(strFuncName, e);
//		}
//
//    	return objRes;
//	}
//
//	public JsonObject getThumbCount(Map<String, Object> mapParams)
//	{
//		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
//		JsonObject objRes = new JsonObject();
//		objRes.addProperty("THUMB_CNT","0");
//
//		if (m_AC == null)	return null;
//
//		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
//		String strSDocNo			= m_C.getParamValue(mapParams, "SDOC_NO", null);
//		String[] arKey				= m_C.getParamValue(mapParams, "KEY");
//		String keyType				= m_C.getParamValue(mapParams, "KEY_TYPE", "JDOC_NO");
//		String strCoCD				= m_C.getParamValue(mapParams, "CORP_NO", null);
//
//    	try
//    	{
//    		PreparedStatement pStmt = new PreparedStatement(Queries.GET_THUMB_COUNT);
//			pStmt.setColumnName(0, keyType);
//			pStmt.setArray(1, new ArrayList<Object>(Arrays.asList(arKey)));
//
//			m_AC.GetData(pStmt.getQuery(), strFuncName);
//
//			while(m_AC.next())
//			{
//				objRes.addProperty("THUMB_CNT", m_AC.GetString("THUMB_CNT"));
//			}
//	   	}
//    	catch(Exception e)
//		{
//			logger.error(strFuncName, e);
//		}
//
//    	return objRes;
//	}

	public JsonObject getCocardList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject objRes = new JsonObject();

		if (m_AC == null)	return null;

		String strKey			= m_C.getParamValue(mapParams, "APPR_CARD", "");
		String regUser			= m_C.getParamValue(mapParams, "USER_ID", "");
		String fromDate			= m_C.getParamValue(mapParams, "FROM_DATE", "");
		String toDate			= m_C.getParamValue(mapParams, "TO_DATE", "");

		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_COCARD_LIST);
			pStmt.setString(0, strKey);
			pStmt.setString(1, regUser);

			if(m_C.isBlank(fromDate) && m_C.isBlank(toDate)) {
				pStmt.setString(2, "");
			}
			else {
				pStmt.setString(2, fromDate+"-"+toDate);
			}

			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);

			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());

				objRes.add(obj_Item.get("SDOC_NO").getAsString(), obj_Item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return objRes;
	}


	public int Mapping_CardMulti(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int nRes = 0;
		if (m_AC == null)	return 0;

		//String[] key			= m_C.getParamValue(mapParams, "PAIR");
		String[] pair		= m_C.getParamValue(mapParams, "PAIR");
		String user_id		= m_C.getParamValue(mapParams, "USER_ID", "");
		String corp_no		= m_C.getParamValue(mapParams, "CORP_NO", "");


		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.MAPPING_CARD_MULTI);

			//	pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(key)));
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(pair)));
			pStmt.setString(1, corp_no);
			pStmt.setString(2, user_id);

			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);

			String res = "0";
			while(m_AC.next())
			{
				res = m_AC.GetString("CNT");
			}

			try
			{
				nRes = Integer.parseInt(res);
			}
			catch (Exception e) {
				nRes = 0;
			}

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
			nRes = 0;
		}

		return nRes;
	}

	public JsonObject getAttachList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject objRes = new JsonObject();
		
		if (m_AC == null)	return null;
		//Get current function name
		
		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String[] arKey			= m_C.getParamValue(mapParams, "KEY");
	//	String strCoCD				= m_C.getParamValue(mapParams, "CoCD", "");
		String keyType				= m_C.getParamValue(mapParams, "KEY_TYPE", "JDOC_NO");
		String strStartIdx			= m_C.getParamValue(mapParams, "START_IDX", null);
		String strAttachRange	= m_C.getParamValue(mapParams, "PER", null);


		try
    	{
    		PreparedStatement pStmt = new PreparedStatement(Queries.GET_ATTACH_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(arKey)));
			pStmt.setString(1, keyType);		
			pStmt.setString(2, strLang);
			if (m_C.isBlank(strStartIdx)) {	pStmt.setNull(3);	} else {	pStmt.setString(3, strStartIdx);}
			if (m_C.isBlank(strAttachRange)) {	pStmt.setNull(4);	} else {
				if("0".equals(strStartIdx)) {
					pStmt.setString(4, Integer.parseInt(strAttachRange)+"");
				}
				else {
					pStmt.setString(4, Integer.parseInt(strStartIdx)+Integer.parseInt(strAttachRange) - 1 + "");
				}

			}
			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
			
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				objRes.add(obj_Item.get("SDOC_NO").getAsString(), obj_Item);
			}
	   	}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
		
		return objRes;
	}

	public JsonObject getCoCardSlipList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject objRes = new JsonObject();

		if (m_AC == null)	return null;
		//Get current function name

		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String key			= m_C.getParamValue(mapParams, "KEY", null);
	//	String[] arKey				= m_C.getParamValue(mapParams, "KEY");


		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_SLIP_LIST);
			pStmt.setString(0, key);
			pStmt.setString(1, "SDOC_NO");
			pStmt.setString(2,strLang);
			pStmt.setString(3,"");
			pStmt.setString(4,"");


			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);

			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				objRes.add(obj_Item.get("SLIP_IRN").getAsString(), obj_Item);
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return objRes;
	}

	public JsonObject getSlipList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject objRes = new JsonObject();
		
		if (m_AC == null)	return null;
		//Get current function name
				
		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String strSDocNo			= m_C.getParamValue(mapParams, "SDOC_NO", null);
		String[] arKey				= m_C.getParamValue(mapParams, "KEY");
		String keyType				= m_C.getParamValue(mapParams, "KEY_TYPE", "JDOC_NO");
		String strCoCD				= m_C.getParamValue(mapParams, "CORP_NO", null);
		String strStartIdx			= m_C.getParamValue(mapParams, "START_IDX", null);
		String strThumbRange	= m_C.getParamValue(mapParams, "PER", null);

		
		try
    	{
    		PreparedStatement pStmt = new PreparedStatement(Queries.GET_SLIP_LIST);
			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(arKey)));
			pStmt.setString(1, keyType);
			pStmt.setString(2,strLang);
			if (m_C.isBlank(strStartIdx)) {	pStmt.setNull(3);	} else {	pStmt.setString(3, strStartIdx);}
			if (m_C.isBlank(strThumbRange)) {	pStmt.setNull(4);	} else {
				if("0".equals(strStartIdx)) {
					pStmt.setString(4, Integer.parseInt(strThumbRange)+"");
				}
				else {
					pStmt.setString(4, Integer.parseInt(strStartIdx)+Integer.parseInt(strThumbRange) - 1 + "");
				}

			}

			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
			
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				//objRes.addProperty("SLIPDOC_IDX",  nSlipDocdx);
				objRes.add(obj_Item.get("SLIP_IRN").getAsString(), obj_Item);

			//	arObjRes.add(obj_Item);
				//nSlipDocdx += nSlipCnt;
			}
	   	}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
		
		return objRes;
	}

	public JsonArray Get_BookmarkList(String sdocNo, String slipIrn) {
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObjRes = new JsonArray();


		if (m_AC == null)	return null;


		try
		{
			PreparedStatement pStmt = new PreparedStatement(Queries.GET_BOOKMARK_LIST);
			pStmt.setString(0, sdocNo);
			pStmt.setString(1, slipIrn);

			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);


			while(m_AC.next())
			{
				JsonObject obj = new JsonObject();
				arObjRes.add(m_AC.Get_itemObj(obj, m_AC.Get_CurIndex()));
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
			return null;
		}

		return arObjRes;
	}

	public JsonObject getCommentCount(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonObject objRes = new JsonObject();
		
		objRes.addProperty("COMT_CNT", "0");
		
		if (m_AC == null)	return null;
		
		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String strJDocNo			= m_C.getParamValue(mapParams, "KEY", null);

		String strCurUserID		= m_C.getParamValue(session, "USER_ID", null);
		String strCurCorpNo		= m_C.getParamValue(session, "CORP_NO", null);
		
    	try
    	{
    		PreparedStatement pStmt = new PreparedStatement(Queries.GET_COMMENT_COUNT);
    		pStmt.setString(0, strJDocNo);
    	
    		m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
			
    			
			while(m_AC.next())
			{
				objRes.addProperty("COMT_CNT", m_AC.GetString("COMT_CNT"));
			}
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			objRes.addProperty("COMT_CNT", "0");
		}
    	
    	return objRes;
	}
	
	public JsonArray getCommentList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObjRes = new JsonArray();
		
		if (m_AC == null)	return null;
		
		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String strJDocNo			= m_C.getParamValue(mapParams, "KEY", null);

		String strCurUserID		= m_C.getParamValue(session, "USER_ID", null);
		String strCurCorpNo		= m_C.getParamValue(session, "CORP_NO", null);
		
    	try
    	{
    		PreparedStatement pStmt = new PreparedStatement(Queries.GET_COMMENT_LIST);
    		pStmt.setString(0, strJDocNo);
    		pStmt.setString(1, strLang);
    	
    		m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
			
    			
			while(m_AC.next())
			{
				String strUserID 	=  m_AC.GetString("REG_USER");
				String strCorpNo	=  m_AC.GetString("CORP_NO");
				
				JsonObject obj_Item = new JsonObject();
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				
				if(strCurUserID.equals(strUserID) && strCorpNo.equals(strCorpNo))
				{
					obj_Item.addProperty("MY_COMT", "1");
				}
				else
				{
					obj_Item.addProperty("MY_COMT", "0");
				}
				String comtData = obj_Item.get("COMT_DATA").getAsString();
				obj_Item.addProperty("COMT_DATA", comtData.replaceAll("〈br〉", "<br>"));
				arObjRes.add(obj_Item);
				
			}
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return arObjRes;
	}
	
	public JsonArray getHistoryList(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		JsonArray arObjRes = new JsonArray();
		
		if (m_AC == null)	return null;
		
		String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String strJDocNo			= m_C.getParamValue(mapParams, "KEY", null);
    	try
    	{
    		PreparedStatement pStmt = new PreparedStatement(Queries.GET_HISTORY_LIST);
    		pStmt.setString(0, strJDocNo);
    		pStmt.setString(1, "JDOC_NO");
    		pStmt.setString(2, strLang);
    		
    		m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
			
			while(m_AC.next())
			{
				JsonObject obj_Item = new JsonObject();
				
				obj_Item = m_AC.Get_itemObj(obj_Item, m_AC.Get_CurIndex());
				arObjRes.add(obj_Item);
			}
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return arObjRes;
	}
}
