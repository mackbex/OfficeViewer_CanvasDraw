package com.woonam.template;

import java.awt.Color;
import java.io.File;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.woonam.connect.AgentConnect;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class CoCard extends TemplateImpl{

	private String m_TemplatePath = null; 
	private AgentConnect m_imageData = null;
	private JsonObject obj_cardInfo = null;
	private JsonArray m_arImageInfo = new JsonArray();
	private int m_nCurPage 					= 0;
	private long m_nFileTotalSize 			= 0;
	private String m_workPath = null;

	private Profile m_Profile = null;
	private Common m_C = new Common();
	private Logger logger = null;
	
	public CoCard(Profile profile) {
		this.m_Profile = profile;
		this.logger = LogManager.getLogger(CoCard.class);
	}
	
	@Override
	public JsonObject run(JsonObject obj_data, String bgPath, String workPath) {
		
		JsonObject obj_res = null;
		if(m_C.isBlank(bgPath)) return null;
		
		this.obj_cardInfo = obj_data;
		this.m_TemplatePath = bgPath;
		this.m_workPath = workPath;
		
		TemplateTool tool = new TemplateTool(m_C.Get_RootPathForJava() + File.separator + m_TemplatePath + File.separator + "00.jpg");
		if(tool != null) {
			tool.setFontStyle("����", tool.NORMAL, 18);
			tool.setFontColor(new Color(0,0,0));
			
			File file = new File(bgPath);
			if(!file.exists())
			{
				file.mkdirs();
			}
				
			obj_res =  Draw(tool);
		}
		
		return obj_res;
	}

	
	//Draw Templete data
	private JsonObject Draw(TemplateTool tool)
	{
		JsonObject obj_res = new JsonObject();
		tool.setFontStyle("����", tool.NORMAL, 31);

		int nFirstVerticalLineX 		= 225;
		int nSecondVerticalLineX 		= 798;
		boolean isDivided = false;
		
		try
		{
			
//			if(this.m_imageData.GetString("DIVD_SPPRC_AMT") != "0") {
//				isDivided = true;
			
			//ī������
			String strCardType = obj_cardInfo.get("CComp").getAsString();
			tool.DrawText(strCardType, nFirstVerticalLineX, 453);
			
			//ī���ȣ
			String strCardNo = obj_cardInfo.get("CardNo").getAsString();	
			strCardNo = strCardNo.replaceAll("(\\d{4})(\\d{4})(\\d{4})(\\d{3,4})", "$1-$2-$3-$4");
			tool.DrawText(strCardNo, nSecondVerticalLineX, 453);
			
			//������
			String strUsedDate = obj_cardInfo.get("UsedDate").getAsString();
			String strUsedTime = obj_cardInfo.get("UsedTime").getAsString();
			strUsedDate = strUsedDate.replaceAll("(\\d{4})(\\d{2})(\\d{2})", "$1�� $2�� $3�� ");
			strUsedTime = strUsedTime.replaceAll("(\\d{2})(\\d{2})(\\d{2})", "$1:$2");
			tool.DrawText(strUsedDate+strUsedTime, nFirstVerticalLineX, 698);
			
			//���ι�ȣ
			String strApprNo = obj_cardInfo.get("ApprNo").getAsString();
			tool.DrawText(strApprNo, nFirstVerticalLineX, 1064);
			
			//������ҿ���
			String strApprCD = obj_cardInfo.get("ApprType").getAsString();	//this.m_imageData.GetString("APRVL_CNCL_FG_CD");
			String strApprNM = "";
			strApprNM = strApprCD;
//			if("1".equalsIgnoreCase(strApprCD))
//			{
//				strApprNM = "����";
//			}
//			else if("2".equalsIgnoreCase(strApprCD))
//			{
//				strApprNM = "���";
//			}
//			else
//			{
//				strApprNM = strApprCD;
//			}
			tool.DrawText(strApprNM, nFirstVerticalLineX, 941);
			
			//�����ݾ�
			String strSPPRC_AMT =  obj_cardInfo.get("Amount").getAsString();		// m_imageData.GetString("SPPRC_AMT");
			if(isDivided) {
				strSPPRC_AMT = obj_cardInfo.get("Amount").getAsString();			//m_imageData.GetString("DIVD_SPPRC_AMT");
			}
			strSPPRC_AMT = strSPPRC_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");	
			//tool.DrawText(strSPPRC_AMT, 334, 290, 450, 320, tool.RIGHT);
			tool.DrawText(strSPPRC_AMT, 1019, 872, 1365, 988, tool.RIGHT);
			
			//�ΰ���
			String strVAT_AMT = obj_cardInfo.get("Tax").getAsString();	//m_imageData.GetString("TAXAMT_AMT");
			if(isDivided) {
				strVAT_AMT = obj_cardInfo.get("Tax").getAsString();		//m_imageData.GetString("DIVD_TAXAMT_AMT");
			}
			strVAT_AMT = strVAT_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");	
			//tool.DrawText(strVAT_AMT, 334, 334, 450, 354, tool.RIGHT);
			tool.DrawText(strVAT_AMT, 1019, 994, 1365, 1110, tool.RIGHT);
			
			//�����
			String strTIP_AMT = obj_cardInfo.get("Tips").getAsString();	//m_imageData.GetString("TIP_AMT");
			if(isDivided) {
				strTIP_AMT = obj_cardInfo.get("Tips").getAsString();		//m_imageData.GetString("DIVD_TIP_AMT");
			}
			strTIP_AMT = strTIP_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");	
			//tool.DrawText(strTIP_AMT,334, 410, 450, 440, tool.RIGHT);
			tool.DrawText(strTIP_AMT,1019, 1239, 1365, 1355, tool.RIGHT);
			
			//�հ�
			String strTOTAL_AMT = obj_cardInfo.get("Total").getAsString();	//m_imageData.GetString("APRVL_AMT");
			if(isDivided) {
				strTOTAL_AMT = obj_cardInfo.get("Total").getAsString();		//m_imageData.GetString("DIVD_AMT");
			}
			strTOTAL_AMT = strTOTAL_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");	
			//tool.DrawText(strTOTAL_AMT,334, 450, 450, 480, tool.RIGHT);
			tool.DrawText(strTOTAL_AMT,1019, 1361, 1365, 1477, tool.RIGHT);
			
			//������
			String strPARTNER_NM = obj_cardInfo.get("MerchNM").getAsString(); 	// m_partnerData.GetString("MerchNM");
			//tool.DrawMultiLineText(strPARTNER_NM, 104, 535, 260, 567, 140, 0, 4, tool.CENTER);
			tool.DrawMultiLineText(strPARTNER_NM, 307, 1623, 811, 1743, 480, 0, 4, tool.CENTER);
			
			//����ڵ�Ϲ�ȣ
			String strSPLR_CD = obj_cardInfo.get("MerchBizNo").getAsString(); 	//m_imageData.GetString("SELL_COMPANY_REGISTNUM");
			strSPLR_CD = strSPLR_CD.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");	
			//tool.DrawText(strSPLR_CD,270, 535, 450, 567, tool.CENTER);
			tool.DrawText(strSPLR_CD,817, 1623, 1389, 1743, tool.CENTER);
			
			//�ּ�
			String strBASE_ADDR = obj_cardInfo.get("MerchAddr1").getAsString();	//m_partnerData.GetString("BASE_ADDR");
			//tool.DrawMultiLineText(strBASE_ADDR, 104, 596, 450, 626, 330, 0, 2, tool.CENTER);
			tool.DrawMultiLineText(strBASE_ADDR, 307, 1807, 1389, 1926, 980, 0, 2, tool.CENTER);
			
		}
		catch(Exception e)
		{
			logger.error("CoCard - Draw", e);
		//	this.m_resImgInfo = null;
			return null;
		}
		
		savePage(tool);
		
		obj_res.addProperty("TOTAL_SIZE", m_nFileTotalSize / 1024);
		obj_res.add("IMG_INFO", m_arImageInfo);
		obj_res.addProperty("CONVERT_KEY", obj_cardInfo.get("ConvertKey").getAsString());
		obj_res.addProperty("SDOC_NAME", "����ī��("+obj_cardInfo.get("ApprNo").getAsString()+")");
		return obj_res;
	}
	
	private void savePage(TemplateTool tool) {
		
	//	String strImagePath = m_Profile.getString("WAS_INFO", "TEMP_DIR", m_C.Get_RootPathForJava() + File.separator + "temp");
		
		File path = new File(m_workPath);
		if(!path.exists()) {
			path.mkdirs();
		}
		
		String docIRN = m_C.getIRN("");
		StringBuffer sbImgPath = new StringBuffer();
		sbImgPath.append(m_workPath);
		sbImgPath.append(File.separator);
		sbImgPath.append(docIRN);
		sbImgPath.append(".J2K");
		
		long lFileSize = tool.saveImageFile(sbImgPath.toString(), tool.IMAGE_JPG);
		m_nFileTotalSize += lFileSize;
		JsonObject objJsonItem = new JsonObject();
		//-IMPORTANT- save background image size to use on upload slip.
		objJsonItem.addProperty("WIDTH", tool.getBackgroundWidth());
		objJsonItem.addProperty("HEIGHT", tool.getBackgroundHeight());
		objJsonItem.addProperty("SIZE", lFileSize / 1024);
		objJsonItem.addProperty("INDEX", m_nCurPage);
		objJsonItem.addProperty("DOC_IRN", docIRN);
		objJsonItem.addProperty("PATH", sbImgPath.toString());
		objJsonItem.addProperty("NAME", "����ī��");
		m_arImageInfo.add(objJsonItem);
	}
	
	
}