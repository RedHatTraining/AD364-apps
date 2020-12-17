package com.eventplanning.listeners;

import java.util.Arrays;

import org.kie.api.event.process.ProcessCompletedEvent;
import org.kie.api.event.process.ProcessEventListener;
import org.kie.api.event.process.ProcessNodeLeftEvent;
import org.kie.api.event.process.ProcessNodeTriggeredEvent;
import org.kie.api.event.process.ProcessStartedEvent;
import org.kie.api.event.process.ProcessVariableChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TabbedProcessEventListener implements ProcessEventListener {

    protected static final transient Logger logger = LoggerFactory.getLogger(ProcessEventListener.class);
    
    ObjectMapper mapper = new ObjectMapper();
    
    private String toJson(Iterable<Object> objects) {
    	StringBuilder sb = new StringBuilder();
    	for(Object object : objects) {
        	sb.append("\n\t");
        	try {
    			sb.append("{\"" + object.getClass().getCanonicalName() + "\":" + mapper.writeValueAsString(object) + "}");
    		} catch (JsonProcessingException e) {
    			logger.error("Unable to serialize object [%s]\n\t", object);
    			logger.debug(e.getMessage(), e);
    			sb.append(object.toString());
    		}
    	}
    	return sb.toString();
    }
        
    private String toJson(Object... objects) {
    	return toJson(Arrays.asList(objects));
    }

    public void afterNodeLeft(ProcessNodeLeftEvent event) {
    	logger.info(String.format("\n\tProcess [%s] exited node [%s]"
    			, event.getProcessInstance().getProcessName()
    			, event.getNodeInstance().getNodeName()));
    }

    public void afterNodeTriggered(ProcessNodeTriggeredEvent event) {
    	logger.info(String.format("\n\tProcess [%s] triggered node [%s]"
    			, event.getProcessInstance().getProcessName()
    			, event.getNodeInstance().getNodeName()));
    }

    public void afterProcessCompleted(ProcessCompletedEvent event) {
    	logger.info(String.format("\n\tProcess [%s] completed"
    			, event.getProcessInstance().getProcessName()));
    }

    public void afterProcessStarted(ProcessStartedEvent event) {
    	logger.info(String.format("\n\tProcess [%s] started"
    			, event.getProcessInstance().getProcessName()));
    }

    public void afterVariableChanged(ProcessVariableChangedEvent event) {
    	logger.info(String.format("\n\tProcess [%s] changed variable [%s] from %s\n\tto%s"
    			, event.getProcessInstance().getProcessName()
    			, event.getVariableId()
    			, toJson(event.getOldValue())
    			, toJson(event.getNewValue())));
    }

    public void beforeNodeLeft(ProcessNodeLeftEvent event) {
    	logger.info(String.format("\n\tProcess [%s] is about to exit node [%s]"
    			, event.getProcessInstance().getProcessName()
    			, event.getNodeInstance().getNodeName()));
    }

    public void beforeNodeTriggered(ProcessNodeTriggeredEvent event) {
    	logger.info(String.format("\n\tProcess [%s] is about to trigger node [%s]"
    			, event.getProcessInstance().getProcessName()
    			, event.getNodeInstance().getNodeName()));
    }

    public void beforeProcessCompleted(ProcessCompletedEvent event) {
    	logger.info(String.format("\n\tProcess [%s] is about to complete"
    			, event.getProcessInstance().getProcessName()));
    }

    public void beforeProcessStarted(ProcessStartedEvent event) {
    	logger.info(String.format("\n\tProcess [%s] is about to start"
    			, event.getProcessInstance().getProcessName()));
    }

    public void beforeVariableChanged(ProcessVariableChangedEvent event) {
    	logger.info(String.format("\n\tProcess [%s] is about to change variable [%s] from %s\n\tto%s"
    			, event.getProcessInstance().getProcessName()
    			, event.getVariableId()
    			, toJson(event.getOldValue())
    			, toJson(event.getNewValue())));
    }

}
