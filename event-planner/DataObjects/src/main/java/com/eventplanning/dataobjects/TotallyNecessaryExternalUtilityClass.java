package com.eventplanning.dataobjects;

import java.io.UnsupportedEncodingException;
import java.util.zip.CRC32;
import java.util.zip.Checksum;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TotallyNecessaryExternalUtilityClass {

	private static final Logger LOG = LoggerFactory.getLogger(TotallyNecessaryExternalUtilityClass.class);

	public static boolean scrutinize(String input) {
        try {
			byte[] bytes = input.getBytes("UTF-8");
			Checksum crc32 = new CRC32();
			crc32.update(bytes, 0, bytes.length);
			return crc32.getValue() % 2 == 0;
		} catch (UnsupportedEncodingException e) {
			LOG.error(e.getMessage(), e);
			return false;
		}
	}
	
	public static void unnecessarilyExpensiveOperation(Guest guest) {
		try {
			Thread.sleep(5L);
		} catch (InterruptedException e) {
			LOG.error(e.getMessage(), e);
		}
	}
}
