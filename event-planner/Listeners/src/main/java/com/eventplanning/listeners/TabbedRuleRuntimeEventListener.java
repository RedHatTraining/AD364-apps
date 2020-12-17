package com.eventplanning.listeners;

import java.util.Arrays;

import org.kie.api.event.rule.ObjectDeletedEvent;
import org.kie.api.event.rule.ObjectInsertedEvent;
import org.kie.api.event.rule.ObjectUpdatedEvent;
import org.kie.api.event.rule.RuleRuntimeEventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TabbedRuleRuntimeEventListener implements RuleRuntimeEventListener {

    protected static final transient Logger logger = LoggerFactory.getLogger(RuleRuntimeEventListener.class);
    
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

    public void objectInserted(ObjectInsertedEvent event) {
    	logger.info(String.format("\n\tObject inserted%s", toJson(event.getObject())));
    }

    public void objectUpdated(ObjectUpdatedEvent event) {
    	logger.info(String.format("\n\tObject updated from%s\n\tto%s", toJson(event.getOldObject()), toJson(event.getObject())));
    }

    public void objectDeleted(ObjectDeletedEvent event) {
    	logger.info(String.format("\n\tObject deleted%s", toJson(event.getOldObject())));
    }

}
