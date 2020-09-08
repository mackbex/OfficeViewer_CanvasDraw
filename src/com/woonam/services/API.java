package com.woonam.services;

import java.io.File;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.woonam.template.*;
import org.apache.commons.io.FileUtils;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.woonam.connect.AgentConnect;
import com.woonam.model.GetModel;
import com.woonam.model.SetModel;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class API {

	private Common m_C				 	= null;
	private String m_confPath			= null;
	private AgentConnect m_AC 		= null;
	private GetModel m_GM				= null;
	private SetModel m_SM				= null;
	private Logger logger = null;
	
	
	enum ENUM_COMMAND{  
		SET_CHANGE_KEY,
		SET_DELETE_KEY,
		SET_CHANGE_STEP,
		COPY_SLIP,
		GET_COUNT,
		GET_LIST,
		GET_IMAGE_URL,
		UPLOAD_CARD,
		SET_CARD_KEY,
		UPLOAD_TAX,
		UPLOAD_CASH,
		DELETE_BY_KIND,
		MAPPING_CARD_MULTI,
		UNMAPPING_CARD,
		UPLOAD_AFTER,
		REMOVE_AFTER,
		REMOVE_AFTER_ALL
	}
	
	API() {
		this.logger = LogManager.getLogger(API.class);
		this.m_C 				= new Common();
		this.m_confPath		= m_C.Get_RootPathForJava()+"/conf/conf.ini";
	}
	
	//Run command
	public JsonObject Run_WebService(Map params) {
		
		//JsonObject obj_Params = null;
		
		if(params == null) {
			logger.error("Web Service : False. Null parameter.");
			return ResultMsg("F","ERR_NULL_PARAM");
		}
		
		Profile profile					= new Profile(m_confPath);
		StringBuffer sbWorkPath 	= new StringBuffer();

	//	obj_Params = Parse_Params(params);
		
		ENUM_COMMAND EC = null;
		
		try
		{	
			String command = m_C.getParamValue(params, "COMMAND", null);
			StringBuffer sbParams = new StringBuffer();
			Iterator it = params.entrySet().iterator();
		    while (it.hasNext()) {
		        Map.Entry pair = (Map.Entry)it.next();
		        sbParams.append(pair.getKey().toString() + " = ");
        		sbParams.append("\n");
		        
		        if(pair.getValue() instanceof String[]) {
		        	
		        	String val[] = (String[]) pair.getValue() ;
		        	
		        	for(int i = 0; i < val.length; i++ ) {
		        		sbParams.append(val[i]);
		        		sbParams.append(" ");
		        	}
		        }
		        
		        sbParams.append("\n");
		    //    it.remove(); // avoids a ConcurrentModificationException
		    }
		
			
//			String command = (obj_Params.get("COMMAND") == null || obj_Params.get("COMMAND").isJsonNull())
//					? null : obj_Params.get("COMMAND").getAsString();
			
			logger.info("----------------------------------------"
					+ "\nWebService : Command - "+command);
			
			logger.info("----------------------------------------"
					+ "\nWebService : Params - "+sbParams.toString());
			//Check command
			if(m_C.isBlank(command))
			{
	    		logger.error("WebService : Command is null");
				return ResultMsg("F", "ERR_NULL_COMMAND");
			}
			
			//Check injection
			if(m_C.IsInjection(command) )
			{
				logger.error("WebService : Injection detected.");
				return ResultMsg("F", "ERR_INJECTION_DETECTED");
			}
			
			this.m_AC				= new AgentConnect(profile);
			this.m_GM				= new GetModel(m_AC);
			this.m_SM				= new SetModel(m_AC);
			
			try {
				EC 	= ENUM_COMMAND.valueOf(command);
			}
			catch(Exception e) {
				return ResultMsg("F", "ERR_UNKNOWN_COMMAND");
			}
			switch(EC) {
			default : {
				return ResultMsg("F", "ERR_UNKNOWN_COMMAND");
			}
			case SET_CHANGE_KEY : {
				String[] verifyList = {"FROM","TO","USER_ID","CORP_NO"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				

				String userID 	= m_C.getParamValue(params, "USER_ID", null);
				String coCD 	= m_C.getParamValue(params, "CORP_NO", null);
				String lang 		= m_C.getParamValue(params, "LANG", "ko");
				
				//Verify user info
				JsonObject obj_userInfo = m_GM.getUserInfo(userID, coCD, lang);
				
				if(obj_userInfo == null || obj_userInfo.isJsonNull()) {
					logger.info("WebService : No user exists. "
							+ "USER_ID : " + userID 
							+ " CORP_NO : " + coCD 
							+ " LANG : " + lang);
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				JsonObject resMsg = null;
				int resCnt = m_SM.Change_JDocNo(params);
				
				switch(resCnt) {
				case -1 : {
					resMsg = ResultMsg("F", "FAILED_CONNECT_AGENT");
				}
				default : {
					resMsg = ResultMsg("T", resCnt+"");
				}
				}
				
				return resMsg;
				
			}
			case DELETE_BY_KIND : {
				String[] verifyList = {"USER_ID","KEY","CORP_NO","KIND"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				boolean bRes = m_SM.Remove_byKind(params);
				
				JsonObject obj_res = null;
				if(bRes) {
					obj_res = ResultMsg("T", "");
				}
				else {
					obj_res = ResultMsg("F", "");
				}
				
				return obj_res;		
			}
			case SET_DELETE_KEY : {
				
				String[] verifyList = {"USER_ID","KEY","CORP_NO"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				HashMap mapVals = new HashMap<String, String[]>();
				mapVals.put("VALUE", params.get("KEY"));
				mapVals.put("USER_ID", params.get("USER_ID"));
				mapVals.put("CORP_NO", params.get("CORP_NO"));
				
				boolean bRes = m_SM.removeAll(mapVals);
				
				JsonObject obj_res = null;
				if(bRes) {
					obj_res = ResultMsg("T", "");
				}
				else {
					obj_res = ResultMsg("F", "");
				}
				
				return obj_res;				
			}
			case SET_CHANGE_STEP : {
				String[] verifyList = {"USER_ID","KEY","CORP_NO","STEP"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				boolean bRes = m_SM.Change_Step(params);
				
				JsonObject obj_res = null;
				if(bRes) {
					obj_res = ResultMsg("T", "");
				}
				else {
					obj_res = ResultMsg("F", "");
				}
				
				return obj_res;				
			}
			case MAPPING_CARD_MULTI : {
				String[] verifyList = {"USER_ID","PAIR","CORP_NO"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				int nRes = m_GM.Mapping_CardMulti(params);
				
				JsonObject obj_res = null;
				if(nRes > 0) {
					obj_res = ResultMsg("T", ""+nRes);
				}
				else {
					obj_res = ResultMsg("F", ""+nRes);
				}
				
				return obj_res;			
			}
			case UNMAPPING_CARD : {
				String[] verifyList = {"USER_ID","KEY","CORP_NO","APPR_NO"};

				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}

				boolean bRes = m_SM.Unmapping_Card(params);

				JsonObject obj_res = null;
				if(bRes) {
					obj_res = ResultMsg("T", "");
				}
				else {
					obj_res = ResultMsg("F", "");
				}

				return obj_res;
			}
			case COPY_SLIP : {
				String[] verifyList = {"FROM","TO","CORP_NO","USER_ID"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				int resCnt = m_SM.Copy_SlipDoc(params);
				
				JsonObject obj_res = null;
				if(resCnt > 0) {
					obj_res = ResultMsg("T", resCnt+"");
				}
				else {
					obj_res = ResultMsg("F", resCnt+"");
				}
				
				return obj_res;
			}
			case GET_IMAGE_URL : {
				String[] verifyList = {"KEY", "USER_ID", "CORP_NO"};

				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}

				JsonObject objRes = m_GM.getSlipList(params);
				Iterator<String> keys = objRes.keySet().iterator();

				JsonArray arUrl = new JsonArray();

				while(keys.hasNext()) {
					String key = keys.next();
					JsonObject item = objRes.get(key).getAsJsonObject();
					String docIrn 	= item.get("DOC_IRN").getAsString();
					String docNo 	= item.get("DOC_NO").getAsString();

					StringBuffer sbUrl = new StringBuffer();
					sbUrl.append("DownloadImage.do?");
					sbUrl.append("DocIRN=");
					sbUrl.append(docIrn);
					sbUrl.append("&Idx=");
					sbUrl.append(docNo);
					sbUrl.append("&UserID=");
					sbUrl.append(m_C.getParamValue(params, "USER_ID", ""));
					sbUrl.append("&CorpNo=");
					sbUrl.append(m_C.getParamValue(params, "CORP_NO", ""));

					arUrl.add(sbUrl.toString());
				}

				return ResultMsg("T",arUrl.toString());
			}
			case GET_LIST : {
				String[] verifyList = {"KEY"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				JsonArray arObj_Res = m_GM.Get_SlipList(params);
				
				return ResultMsg("T",arObj_Res.toString());
			}
			case GET_COUNT : {
				String[] verifyList = {"KEY"};
				
				//Parameter validation.
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
				
				JsonArray obj_cnt = m_GM.Get_SlipCnt(params);
				
				return ResultMsg("T",obj_cnt.toString());
			}
			case REMOVE_AFTER: {
				String[] verifyList = new String[] { "USER_ID", "KEY", "CORP_NO" };
				if (!VerifyParams(verifyList, params))
					return ResultMsg("F", "ERR_INVALIED_PARAM");
				HashMap<String, Object> mapVals = new HashMap<>();
				mapVals.put("VALUE", params.get("KEY"));
				mapVals.put("USER_ID", params.get("USER_ID"));
				mapVals.put("CORP_NO", params.get("CORP_NO"));
				boolean bRes = this.m_SM.removeAfter(mapVals);
				JsonObject objRes = null;
				if (bRes) {
					objRes = ResultMsg("T", "");
				} else {
					objRes = ResultMsg("F", "");
				}
				return objRes;
			}
			case REMOVE_AFTER_ALL: {
				String[] verifyList = new String[] { "USER_ID", "KEY", "CORP_NO" };
				if (!VerifyParams(verifyList, params))
					return ResultMsg("F", "ERR_INVALIED_PARAM");
				HashMap<String, Object> mapVals = new HashMap<>();
				mapVals.put("VALUE", params.get("KEY"));
				mapVals.put("USER_ID", params.get("USER_ID"));
				mapVals.put("CORP_NO", params.get("CORP_NO"));
				boolean bRes = this.m_SM.removeAfterAll(mapVals);
				JsonObject objRes = null;
				if (bRes) {
					objRes = ResultMsg("T", "");
				} else {
					objRes = ResultMsg("F", "");
				}
				return objRes;
			}
			case UPLOAD_AFTER : {
				String[] verifyList = new String[] { "KEY", "USER_ID", "CORP_NO" };

				if (!VerifyParams(verifyList, params)) return ResultMsg("F", "ERR_INVALIED_PARAM");

				String afterImgPath = this.m_C.Get_RootPathForJava() + File.separator + profile.getString("TEMPLATE", "AFTER_BG", "") + File.separator + "00_org.jpg";

				JsonObject objImgInfo = new JsonObject();
				objImgInfo.addProperty("PATH", afterImgPath);
				objImgInfo.addProperty("DOC_IRN", this.m_C.getIRN(""));
				objImgInfo.addProperty("WIDTH", 2480);
				objImgInfo.addProperty("HEIGHT", 3508);
				objImgInfo.addProperty("SIZE", 318);
				objImgInfo.addProperty("NAME", "AFTER");

				JsonArray arObjImgInfo = new JsonArray();
				arObjImgInfo.add(objImgInfo);

				JsonObject objSlipInfo = new JsonObject();
				objSlipInfo.addProperty("SDOC_KIND", "9000");
				objSlipInfo.addProperty("CONVERT_KEY", this.m_C.getParamValue(params, "KEY", ""));
				objSlipInfo.addProperty("SDOC_NAME", "후첨");
				objSlipInfo.addProperty("COPY_REPLACE", false);
				objSlipInfo.addProperty("IS_FOLLOW", true);

				objSlipInfo.add("IMG_INFO", arObjImgInfo);
				UploadSlip upload = new UploadSlip(profile);
				JsonObject res = upload.run(objSlipInfo, params, sbWorkPath.toString());
				JsonObject objRes = new JsonObject();
				objRes.addProperty("RESULT", res.get("result").getAsString());
				objRes.addProperty("MSG", res.get("msg").getAsString());
				return objRes;
			}

			case UPLOAD_TAX : {
				String[] verifyList = {"ISSUE_ID", "KEY", "USER_ID", "CORP_NO"};
				
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}
//				JsonObject obj_taxInfo = new JsonObject();
//				obj_taxInfo.addProperty("ConvertKey","2017100550000002f1225920");
//				obj_taxInfo.addProperty("ItemJoinKey","2017100550000002f1225920");
//				obj_taxInfo.addProperty("Approve","2017100550000002f1225920");
//				obj_taxInfo.addProperty("Cabinet","20171005");
//				obj_taxInfo.addProperty("TypeCode","0101");
//				obj_taxInfo.addProperty("TaxType","01");
//				obj_taxInfo.addProperty("PurPose","02");
//				obj_taxInfo.addProperty("ModCode","");
//				obj_taxInfo.addProperty("ModText","");
//				obj_taxInfo.addProperty("Note","");
//				obj_taxInfo.addProperty("TypeCode3","0101");
//				obj_taxInfo.addProperty("FromLicense","1028142945");
//				obj_taxInfo.addProperty("FromTaxCode","0");
//				obj_taxInfo.addProperty("FromTitle","주식회사 케이티");
//				obj_taxInfo.addProperty("FromCEO","황창규");
//				obj_taxInfo.addProperty("FromAddr","경기도 성남시 분당구 불정로 90");
//				obj_taxInfo.addProperty("FromBiz","통신업,부동산업");
//				obj_taxInfo.addProperty("FromEvent","전신전화,부가통신,임대");
//				obj_taxInfo.addProperty("FromDept","");
//				obj_taxInfo.addProperty("FromDeptName","");
//				obj_taxInfo.addProperty("FromDeptTel","");
//				obj_taxInfo.addProperty("FromEmail","");
//				obj_taxInfo.addProperty("ToTypeCode","01");
//				obj_taxInfo.addProperty("ToLicense","2038200639");
//				obj_taxInfo.addProperty("ToTaxCode","0");
//				obj_taxInfo.addProperty("ToTitle","대한적십자사");
//				obj_taxInfo.addProperty("ToCEO","김성주");
//				obj_taxInfo.addProperty("ToAddr","서울 중구 남산동3가 32번지");
//				obj_taxInfo.addProperty("ToBiz","서비스(운수관)");
//				obj_taxInfo.addProperty("ToEvent","673903");
//				obj_taxInfo.addProperty("ToDept_1","");
//				obj_taxInfo.addProperty("ToDeptName_1","");
//				obj_taxInfo.addProperty("ToDeptTel_1","");
//				obj_taxInfo.addProperty("ToEmail_1","");
//				obj_taxInfo.addProperty("ToDept_1","");
//				obj_taxInfo.addProperty("ToDept_2","");
//				obj_taxInfo.addProperty("ToDeptName_2","");
//				obj_taxInfo.addProperty("ToDeptTel_2","");
//				obj_taxInfo.addProperty("ToEmail_2","");
//				obj_taxInfo.addProperty("TrLicense","");
//				obj_taxInfo.addProperty("TrTaxCode","");
//				obj_taxInfo.addProperty("TrCEO","");
//				obj_taxInfo.addProperty("TrTitle","");
//				obj_taxInfo.addProperty("TrAddr","");
//				obj_taxInfo.addProperty("TrBiz","");
//				obj_taxInfo.addProperty("TrEvent","");
//				obj_taxInfo.addProperty("PaidType","");
//				obj_taxInfo.addProperty("PaidAmount","");
//				obj_taxInfo.addProperty("Provision","15000");
//				obj_taxInfo.addProperty("Tax","1500");
//				obj_taxInfo.addProperty("Total","16500");
//				obj_taxInfo.addProperty("Cash","");
//				obj_taxInfo.addProperty("CashCheck","");
//				obj_taxInfo.addProperty("PostCheck","");
//				obj_taxInfo.addProperty("Credit","");
//				obj_taxInfo.addProperty("CorpNo","1000");
//				obj_taxInfo.addProperty("PartNo","000000");
//				obj_taxInfo.addProperty("RegUser","System");
//				obj_taxInfo.addProperty("SDocKind","1101");
//				obj_taxInfo.addProperty("PTI_STATUS","00");


				JsonObject obj_taxInfo = m_GM.Get_taxConverList(params);
				
				if(obj_taxInfo == null || obj_taxInfo.size() <= 0) {
					return ResultMsg("F", "NO_TAX_LIST");
				}
				
				JsonObject obj_res = null; 
				String resStat = "";
				
				int res_total = 0;
//				for(int i=0; i<arObj_Res.size(); i++) {
//					JsonObject resItem = arObj_Res.get(i).getAsJsonObject();
				resStat = obj_taxInfo.get("PTI_STATUS").getAsString();
//				resStat = "00";
				switch (resStat) {
				case "00":
					String itemKey = obj_taxInfo.get("ItemJoinKey").getAsString();
					HashMap mapParamVals = new HashMap<String, String[]>();
					String[] tempKey = {itemKey};
					mapParamVals.put("ISSUE_ID", params.get("ISSUE_ID"));
					mapParamVals.put("TAX_TYPE", params.get("TAX_TYPE"));
					mapParamVals.put("KEY", params.get("KEY"));
					mapParamVals.put("USER_ID", params.get("USER_ID"));
					mapParamVals.put("CORP_NO", params.get("CORP_NO"));
					mapParamVals.put("ITEM_KEY", tempKey);

//					JsonArray ar_taxItemList = new JsonArray();
//					for(int i = 0; i < 8; i++) {
//						JsonObject item = new JsonObject();
//						item.addProperty("IndexNo",(i+1)+"");
//						item.addProperty("dt","20171005");
//						item.addProperty("Name","LTE egg+ 11 (01223603255)");
//						item.addProperty("Info","");
//						item.addProperty("MEINS","");
//						item.addProperty("Cnt","0");
//						item.addProperty("Money","0");
//						item.addProperty("Invoice","15000");
//						item.addProperty("Tax","1500");
//						item.addProperty("Memo","");
//						item.addProperty("ISSUE_ID","2017100550000002f1225920");
//						ar_taxItemList.add(item);
//					}

					JsonArray ar_taxItemList = m_GM.Get_taxItemConverList(mapParamVals);
					
					Tax taxForm = new Tax(profile);
					
					// Set work path
					sbWorkPath.append(m_C.Get_RootPathForJava() + profile.getString("WAS_INFO", "TEMP_DIR",  "temp"));
					sbWorkPath.append(File.separator);
					sbWorkPath.append(m_C.getIRN(""));
					sbWorkPath.append(m_C.getParamValue(params, "USER_ID", "system"));
					sbWorkPath.append(m_C.getToday("yyyyMMddHHmmssSSS"));
					
					obj_taxInfo.add("ITEM_LIST", ar_taxItemList);
					
					JsonObject obj_resImage 	= taxForm.run(obj_taxInfo, profile.getString("TEMPLATE", "TAX_BG", ""), sbWorkPath.toString());
					if(obj_resImage == null || obj_resImage.size() <= 0) {
						return ResultMsg("F", "FAILED_CREATE_TAX");
					}
					obj_resImage.addProperty("SDOC_KIND", obj_taxInfo.get("SDocKind").getAsString());
					
					String convertKey = obj_resImage.get("CONVERT_KEY").getAsString();
					UploadSlip upload = new UploadSlip(profile);
					JsonObject res = upload.run(obj_resImage, params, sbWorkPath.toString());
					
					if("T".equalsIgnoreCase(res.get("result").getAsString())) {
						if(m_SM.Update_taxStatus(convertKey, "10")) {
				
							String[] from = {convertKey};
							
							HashMap mapVals = new HashMap<String, String[]>();
							mapVals.put("FROM", from);
							mapVals.put("TO", params.get("KEY"));
							mapVals.put("USER_ID", params.get("USER_ID"));
							mapVals.put("CORP_NO", params.get("CORP_NO"));
							
							int resCnt = m_SM.Copy_SlipDoc(mapVals);
							res_total += resCnt;
						}
					} else {
						return res;
					}
					
					break;
				case "01":
					obj_res = ResultMsg("T", "CONVERTING_IMAGE");
					return obj_res;
//					break;
					
				case "10":
					HashMap mapVals = new HashMap<String, String[]>();
					mapVals.put("FROM", params.get("ISSUE_ID"));
					mapVals.put("TO", params.get("KEY"));
					mapVals.put("USER_ID", params.get("USER_ID"));
					mapVals.put("CORP_NO", params.get("CORP_NO"));
					int resCnt = m_SM.Copy_SlipDoc(mapVals);
					res_total += resCnt;
					break;
				case "20":
					obj_res = ResultMsg("F","ERR_IMAGE_CONVERT");
					return obj_res;
//					break;
				}
				
				if(res_total > 0) {
					obj_res = ResultMsg("T", res_total+"");
				}
				else {
					obj_res = ResultMsg("F", res_total+"");
				}
				
				return obj_res;
			}

			case UPLOAD_CARD : {
				String[] verifyList = {"APPR_NO", "KEY", "USER_ID", "CORP_NO"};
				
				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}

//				JsonObject obj_cardInfo = new JsonObject();
//				obj_cardInfo.addProperty("ConvertKey","198585");
//				obj_cardInfo.addProperty("CardNo","4009070206296788");
//				obj_cardInfo.addProperty("ApprType","승인");
//				obj_cardInfo.addProperty("CComp","삼성자체법인카드 (대한적십자사)");
//				obj_cardInfo.addProperty("VDATE","");
//				obj_cardInfo.addProperty("ApprDate","2019-09-25");
//				obj_cardInfo.addProperty("ApprTime","11:48:10");
//				obj_cardInfo.addProperty("UsedDate","2019-09-25");
//				obj_cardInfo.addProperty("UsedTime","11:48:10");
//				obj_cardInfo.addProperty("ApprInfo","");
//				obj_cardInfo.addProperty("CancelInfo","");
//				obj_cardInfo.addProperty("Period","");
//				obj_cardInfo.addProperty("GeoraeCard","");
//				obj_cardInfo.addProperty("ApprNo","55439225");
//				obj_cardInfo.addProperty("MccNM","방사선과");
//				obj_cardInfo.addProperty("MerchNM","의료법인녹십자의료재단");
//				obj_cardInfo.addProperty("MerchNo","70209285");
//				obj_cardInfo.addProperty("MerchMst","");
//				obj_cardInfo.addProperty("MerchTel","");
//				obj_cardInfo.addProperty("MerchBizNo","2138203521");
//				obj_cardInfo.addProperty("MerchAddr1","경기 용인시 기흥구 보정동");
//				obj_cardInfo.addProperty("MerchAddr2","314");
//				obj_cardInfo.addProperty("Total","98360");
//				obj_cardInfo.addProperty("Amount","98360");
//				obj_cardInfo.addProperty("Tax","0");
//				obj_cardInfo.addProperty("Tips","0");
//				obj_cardInfo.addProperty("Text","");
//				obj_cardInfo.addProperty("PayType_1","");
//				obj_cardInfo.addProperty("PayType_2","");
//				obj_cardInfo.addProperty("Currency_CD","KRW");
//				obj_cardInfo.addProperty("ForAMT","0");
//				obj_cardInfo.addProperty("SDocKind","1210");
//				obj_cardInfo.addProperty("PTI_STATUS","00");


				JsonObject obj_cardInfo = m_GM.Get_cardConverList(params);
				
				if(obj_cardInfo == null || obj_cardInfo.size() <= 0) {
					return ResultMsg("F", "NO_CARD_LIST");
				}
				
				JsonObject obj_res = null; 
				String resStat = "";
				
				int res_total = 0;
				resStat = obj_cardInfo.get("PTI_STATUS").getAsString();
//				resStat = "00";
				switch (resStat) {
				case "00":
					CoCard cardForm 				= new CoCard(profile);
					
					// Set work path
					sbWorkPath.append(m_C.Get_RootPathForJava() + profile.getString("WAS_INFO", "TEMP_DIR",  "temp"));
					sbWorkPath.append(File.separator);
					sbWorkPath.append(m_C.getIRN(""));
					sbWorkPath.append(m_C.getParamValue(params, "USER_ID", "system"));
					sbWorkPath.append(m_C.getToday("yyyyMMddHHmmssSSS"));
					
					JsonObject obj_resImage 	= cardForm.run(obj_cardInfo, profile.getString("TEMPLATE", "CARD_BG", ""), sbWorkPath.toString());
					
					String convertKey = obj_resImage.get("CONVERT_KEY").getAsString();
					UploadSlip upload = new UploadSlip(profile);
					obj_resImage.addProperty("SDOC_KIND", obj_cardInfo.get("SDocKind").getAsString());
					JsonObject res = upload.run(obj_resImage, params, sbWorkPath.toString());
					
					if("T".equalsIgnoreCase(res.get("result").getAsString())) {
						if(m_SM.Update_cardStatus(convertKey, "10")) {
				
							String[] from = {convertKey};
							
							HashMap mapVals = new HashMap<String, String[]>();
							mapVals.put("FROM", from);
							mapVals.put("TO", params.get("KEY"));
							mapVals.put("USER_ID", params.get("USER_ID"));
							mapVals.put("CORP_NO", params.get("CORP_NO"));
							
							int resCnt = m_SM.Copy_SlipDoc(mapVals);
							res_total += resCnt;
						}
					} else {
						return res;
					}
					
					break;
				case "01":
					obj_res = ResultMsg("T", "CONVERTING_IMAGE");
					return obj_res;
//					break;
					
				case "10":
					//Already exists.
					HashMap mapVals = new HashMap<String, String[]>();
					mapVals.put("FROM", params.get("APPR_NO"));
					mapVals.put("TO", params.get("KEY"));
					mapVals.put("USER_ID", params.get("USER_ID"));
					mapVals.put("CORP_NO", params.get("CORP_NO"));
					
					int resCnt = m_SM.Copy_SlipDoc(mapVals);

					res_total += resCnt;
					break;
					
				case "20":
//					resMsg = ResultMsg("F", "Covert Error");
					obj_res = ResultMsg("F","ERR_IMAGE_CONVERT");
					return obj_res;
//					break;
				}
				
//				JsonObject obj_res = null;
				if(res_total > 0) {
					obj_res = ResultMsg("T", res_total+"");
					JsonObject objUserInfo = m_GM.getUserInfo(
							m_C.getParamValue(params, "USER_ID", ""),
							m_C.getParamValue(params, "CORP_NO", ""),
							"ko");

					String key = m_C.getParamValue(params, "KEY", "");
					m_SM.addBookmark(objUserInfo, m_GM.getSlipInfo(key));
				}
				else {
					obj_res = ResultMsg("F", res_total+"");
				}
				
				return obj_res;
			}
			case UPLOAD_CASH: {
				String[] verifyList = {"APPR_NO", "KEY", "USER_ID", "CORP_NO"};

				if(!VerifyParams(verifyList, params)) {
					return ResultMsg("F","ERR_INVALIED_PARAM");
				}


//				JsonObject obj_cashInfo = new JsonObject();
//				obj_cashInfo.addProperty("ConvertKey","101949479");
//				obj_cashInfo.addProperty("APPR_NO","101949479");
//				obj_cashInfo.addProperty("BIZ_NO","1058202954");
//				obj_cashInfo.addProperty("APPR_DATE","20191206");
//				obj_cashInfo.addProperty("APPR_TIME","090507");
//				obj_cashInfo.addProperty("APPR_ST","승인거래");
//				obj_cashInfo.addProperty("APPR_TYPE","1");
//				obj_cashInfo.addProperty("TOTAL","50000");
//				obj_cashInfo.addProperty("TIPS","0");
//				obj_cashInfo.addProperty("AMOUNT","0");
//				obj_cashInfo.addProperty("TAX","4545");
//				obj_cashInfo.addProperty("MERCH_NAME","（주）에스에스유통선산주유소 상지점");
//				obj_cashInfo.addProperty("MERCH_BIZ_NO","5138512256");
//				obj_cashInfo.addProperty("SDocKind","1310");
//				obj_cashInfo.addProperty("PTI_STATUS","00");


				JsonObject obj_cashInfo = m_GM.Get_cashConverList(params);

				if(obj_cashInfo == null || obj_cashInfo.size() <= 0) {
					return ResultMsg("F", "NO_CASH_LIST");
				}

				JsonObject obj_res = null;
				String resStat = "";

				int res_total = 0;
				resStat = obj_cashInfo.get("PTI_STATUS").getAsString();
//				resStat = "00";
				switch (resStat) {
					case "00":
						CashReceipt cashForm 				= new CashReceipt(profile);

						// Set work path
						sbWorkPath.append(m_C.Get_RootPathForJava() + profile.getString("WAS_INFO", "TEMP_DIR",  "temp"));
						sbWorkPath.append(File.separator);
						sbWorkPath.append(m_C.getIRN(""));
						sbWorkPath.append(m_C.getParamValue(params, "USER_ID", "system"));
						sbWorkPath.append(m_C.getToday("yyyyMMddHHmmssSSS"));

						JsonObject obj_resImage 	= cashForm.run(obj_cashInfo, profile.getString("TEMPLATE", "CASH_BG", ""), sbWorkPath.toString());

						String convertKey = obj_resImage.get("CONVERT_KEY").getAsString();
						UploadSlip upload = new UploadSlip(profile);
						obj_resImage.addProperty("SDOC_KIND", obj_cashInfo.get("SDocKind").getAsString());
						JsonObject res = upload.run(obj_resImage, params, sbWorkPath.toString());

						if("T".equalsIgnoreCase(res.get("result").getAsString())) {
							if(m_SM.Update_cardStatus(convertKey, "10")) {

								String[] from = {convertKey};

								HashMap mapVals = new HashMap<String, String[]>();
								mapVals.put("FROM", from);
								mapVals.put("TO", params.get("KEY"));
								mapVals.put("USER_ID", params.get("USER_ID"));
								mapVals.put("CORP_NO", params.get("CORP_NO"));

								int resCnt = m_SM.Copy_SlipDoc(mapVals);
								res_total += resCnt;
							}
						} else {
							return res;
						}

						break;
					case "01":
						obj_res = ResultMsg("T", "CONVERTING_IMAGE");
						return obj_res;
//					break;

					case "10":
						//Already exists.
						HashMap mapVals = new HashMap<String, String[]>();
						mapVals.put("FROM", params.get("APPR_NO"));
						mapVals.put("TO", params.get("KEY"));
						mapVals.put("USER_ID", params.get("USER_ID"));
						mapVals.put("CORP_NO", params.get("CORP_NO"));

						int resCnt = m_SM.Copy_SlipDoc(mapVals);
						res_total += resCnt;
						break;

					case "20":
//					resMsg = ResultMsg("F", "Covert Error");
						obj_res = ResultMsg("F","ERR_IMAGE_CONVERT");
						return obj_res;
//					break;
				}

//				JsonObject obj_res = null;
				if(res_total > 0) {
					obj_res = ResultMsg("T", res_total+"");
				}
				else {
					obj_res = ResultMsg("F", res_total+"");
				}

				return obj_res;
			}
			}
			
		}
		catch(Exception e) {
			logger.error("Web Service", e);
			if(!m_C.isBlank(sbWorkPath.toString())) {
				try {
					FileUtils.deleteDirectory(new File(sbWorkPath.toString()));
				}
				catch(Exception e2) {
					logger.error("Remove dicectory exception.", e2);
				}
			}
			return ResultMsg("F","ERR_EXCEPTION_OCCURED");
		}
		
	}
	
	/**
	 * Return with message
	 * @param flag
	 * @param msg
	 * @return
	 */
	private JsonObject ResultMsg(String flag, String msg) {
		JsonObject res = new JsonObject();
		res.addProperty("RESULT", flag);
		res.addProperty("MSG", msg);
		return res;
	}
	
	/**
	* Return with message
	* @param msg
	* @return
	*/
	private JsonObject ResultMsg (String msg) {
		JsonObject res = new JsonObject();
		res.addProperty("MSG", msg);
		return res;
	}
	
	/**
	 * Parse parameters
	 * @param params
	 * @return
	 */
	private JsonObject Parse_Params(Map params) {
	
		Gson gson = new Gson(); 
		
		return (new JsonParser()).parse(gson.toJson(params)).getAsJsonObject();
	}
	/**
	 * Verify params
	 * @param
	 * @param
	 * @param
	 * @return
	 */
	
	private boolean VerifyParams(String[] verifyList, Map<String, String[]> params)
	{
		boolean bRes = true;
	
		if(m_C.IsNullParam(verifyList, params))
		{
			StringBuffer sbParams = new StringBuffer();
			for (String key: params.keySet()) {
				sbParams.append("key : "+key + ", params : " + Arrays.toString(params.get(key))+" ");
			}
			logger.error("WebService : Parameter is null.\n" + sbParams.toString());
			bRes = false;
		}
		
		return bRes;
	}
}
