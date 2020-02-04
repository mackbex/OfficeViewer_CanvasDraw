package com.woonam.log4j2;

import java.io.File;
import java.io.FilenameFilter;
import java.util.*;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.config.ConfigurationFactory;
import org.joda.time.DateTime;
import org.joda.time.Days;
import org.joda.time.format.DateTimeFormat;
import org.quartz.DateBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerContext;
import org.quartz.SchedulerException;
import org.quartz.SchedulerFactory;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.SimpleTrigger;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

import com.woonam.util.Common;
import com.woonam.util.Profile;

public class LogScheduler {

    private Profile m_profile = null;
    private String rootPath = null;
    private Scheduler 			scheduler 		= null;
    private Common m_C = null;
    //private static Logger logger = LogManager.getLogger("Woonam");

    public LogScheduler(String rootPath) {
        this.m_C = new Common();
        this.rootPath = rootPath;
        this.m_profile = new Profile(rootPath + "conf" + File.separator + "conf.ini");

    }

    public boolean initLogFile() {
        boolean isInit = false;


        try {
            String logPath = this.rootPath + File.separator + m_profile.getString("LOG","PATH","logs");
            File folder = new File(logPath);

            if(!folder.exists()) {
                folder.mkdirs();
            }

            String logName = m_profile.getString("LOG","NAME","console.log");
            File logFile = new File( logPath + File.separator + logName);

            if(!logFile.exists()) {
                return true;
            }

            String today = m_C.getToday("yyyyMMdd");
            String[] target = folder.list(new FilenameFilter() {
                @Override
                public boolean accept(File dir, String name) {


                    if(name.contains(today)) {
                         return true;
                    }
                    else {
                        return false;
                    }
                }
            });

            if(target == null || target.length <= 0) {
                isInit = m_C.ReNameFile(logPath + File.separator + today + "_1.log", logFile.getAbsolutePath());
            } else {

                List<String> listTarget = Arrays.asList(target);
                String maxVal = Collections.max(listTarget, new Comparator<String>() {
                    @Override
                    public int compare(String a, String b) {

                        if (getLogFileIndex(a) > getLogFileIndex(b))
                            return 1; // highest value first
                        if (getLogFileIndex(a) == getLogFileIndex(b))
                            return 0;
                        return -1;
                    }
                });

                int nLastIndex = getLogFileIndex(maxVal);

                m_C.ReNameFile(logPath + File.separator + today + "_" + (nLastIndex + 1) +".log", logFile.getAbsolutePath());

                isInit = true;
            }
        }
        catch (Exception e) {
            System.out.println("initLogFile() fail : " + e);

        }
        return isInit;
    }

    public boolean run() {

        if(this.m_profile == null) return false;

//        if(!initLogFile()) {
//            System.out.println("FATAL ERROR :: Failed to init log file.. ");
//            return false;
//        }

        if(!Init_Scheduler()) {
            System.out.println("FATAL ERROR :: Failed to init scheduler.. ");
            return false;
        }

        return true;
    }

    private int getLogFileIndex(String name) {

        int res = -99;

        try {
            res = Integer.parseInt(name.substring(9, name.length() - 4));;
        }
        catch (Exception e) {
            res = -99;
        }

        return res;

    }

    private boolean Init_Scheduler() {
        try {
            Properties quartzProperties = new Properties();
            quartzProperties.put("org.quartz.threadPool.threadCount", "1");

            //	private String EXPIRE = null;
            SchedulerFactory schedulFactoty = new StdSchedulerFactory(quartzProperties);
            scheduler 		= schedulFactoty.getScheduler();
            //  scheduler.shutdown();
            scheduler.clear();
            scheduler.start();

            // define the job and tie it to our HelloJob class
            JobBuilder jobBuilder = JobBuilder.newJob(LogRolling.class);
            JobDataMap data = new JobDataMap();
            data.put("latch", this);
            data.put("trace", null);
            data.put("port", 0);

            JobDetail jobDetail = jobBuilder.usingJobData("Rolling", "com.woonam.log4j2.LogRolling")
                    .usingJobData(data)
                    .withIdentity("Rolling", "Log")
                    .build();


            // Trigger the job to run now, and then every 40 seconds
            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity("trigger", "group")
                    .startAt(DateBuilder.todayAt(0, 0, 0))
//            .startNow()
                    .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                            .withRepeatCount(SimpleTrigger.REPEAT_INDEFINITELY)
                            .withIntervalInHours(24))
                    .build();

            SchedulerContext sc = scheduler.getContext();
            sc.put("LOG_PATH", 	this.rootPath + File.separator + m_profile.getString("LOG","PATH","logs"));
            sc.put("EXPIRE",	m_profile.getString("LOG", "EXPIRE", "30"));

            // Tell quartz to schedule the job using our trigger
            scheduler.scheduleJob(jobDetail, trigger);

        } catch (SchedulerException e) {

            System.out.println("Init_Scheduler() fail : " + e);
            LogManager.getLogger(LogScheduler.class).error("Init_Scheduler() fail : ", e);
            try {
                scheduler.shutdown(true);
            } catch (SchedulerException e1) {
                // TODO Auto-generated catch block
                System.out.println("Init_Scheduler() fail : " + e1);
                LogManager.getLogger(LogScheduler.class).error("Init_Scheduler() fail : ", e1);
            }
            return false;
        }
        return true;
    }

    public boolean shutdown() {
        try {
            scheduler.shutdown(true);
            LogManager.shutdown();
        } catch (SchedulerException e1) {
            System.out.println("Shutdown scheduler failed. : " + e1);
            LogManager.getLogger(LogScheduler.class).error("Shutdown scheduler failed. : ", e1);
            return false;
        }
        return true;
    }
}
