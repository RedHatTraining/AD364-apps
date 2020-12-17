package com.eventplanning.listeners;

import org.drools.core.event.DebugAgendaEventListener;
import org.kie.api.event.rule.AfterMatchFiredEvent;
import org.kie.api.event.rule.AgendaEventListener;
import org.kie.api.event.rule.BeforeMatchFiredEvent;
import org.kie.api.event.rule.MatchCancelledEvent;
import org.kie.api.event.rule.MatchCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TabbedAgendaEventListener extends DebugAgendaEventListener {

    protected static final transient Logger logger = LoggerFactory.getLogger(AgendaEventListener.class);
    
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

    public void matchCreated(MatchCreatedEvent event) {
    	logger.info(String.format("\n\tMatch created for rule [%s] with objects %s"
    			, event.getMatch().getRule().getName()
    			, toJson(event.getMatch().getObjects())));
    }

    public void matchCancelled(MatchCancelledEvent event) {
    	logger.info(String.format("\n\tMatch cancelled for rule [%s] with objects %s"
    			, event.getMatch().getRule().getName()
    			, toJson(event.getMatch().getObjects())));
    }

    public void beforeMatchFired(BeforeMatchFiredEvent event) {
    	logger.info(String.format("\n\tMatch for rule [%s] about to fire with objects %s"
    			, event.getMatch().getRule().getName()
    			, toJson(event.getMatch().getObjects())));
    }

    public void afterMatchFired(AfterMatchFiredEvent event) {
    	logger.info(String.format("\n\tMatch for rule [%s] fired with objects %s"
    			, event.getMatch().getRule().getName()
    			, toJson(event.getMatch().getObjects())));
    }

    public void agendaGroupPopped(org.kie.api.event.rule.AgendaGroupPoppedEvent event) {
    	logger.info(String.format("\n\tAgenda group [%s] popped", event.getAgendaGroup().getName()));
    }

    public void agendaGroupPushed(org.kie.api.event.rule.AgendaGroupPushedEvent event) {
    	logger.info(String.format("\n\tAgenda group [%s] pushed", event.getAgendaGroup().getName()));
    }

    public void beforeRuleFlowGroupActivated(org.kie.api.event.rule.RuleFlowGroupActivatedEvent event) {
    	logger.info(String.format("\n\tRuleFlow group [%s] about to activate", event.getRuleFlowGroup().getName()));
    }

    public void afterRuleFlowGroupActivated(org.kie.api.event.rule.RuleFlowGroupActivatedEvent event) {
    	logger.info(String.format("\n\tRuleFlow group [%s] is now active", event.getRuleFlowGroup().getName()));
    }

    public void beforeRuleFlowGroupDeactivated(org.kie.api.event.rule.RuleFlowGroupDeactivatedEvent event) {
    	logger.info(String.format("\n\tRuleFlow group [%s] is now inactive", event.getRuleFlowGroup().getName()));
    }

    public void afterRuleFlowGroupDeactivated(org.kie.api.event.rule.RuleFlowGroupDeactivatedEvent event) {
    	logger.info(String.format("\n\tRuleFlow group [%s] about to deactivate", event.getRuleFlowGroup().getName()));
    }
}
