from .Database import Database


class DataRepository:
    @staticmethod
    def json_or_formdata(request):
        if request.content_type == 'application/json':
            gegevens = request.get_json()
        else:
            gegevens = request.form.to_dict()
        return gegevens

    @staticmethod
    def read_all_readings():
        sql = """
        SELECT 
	        `r`.`id` AS `readingID`,
	        `r`.`datainput` AS `datainput`,
	        `s`.`id` AS `sensorID`,
	        `s`.`name` AS `sensorName`,
	        `s`.`description` AS `sensorDescription`,
	        `s`.`unit` AS `sensorUnit`,
	        `r`.`value` AS `value`,
	        `a`.`id` AS `actuatorID`,
	        `a`.`name` AS `actuatorName`,
	        `a`.`status` AS `actuatorStatus`,
	        `p`.`id` AS `pumpsID`,
	        `p`.`name` AS `pumpsName`,
	        `p`.`description` AS `pumpsDescription`
        FROM
	        (((`greenhouse`.`reading` `r`
	        JOIN `greenhouse`.`sensor` `s` ON ((`r`.`sensorId` = `s`.`id`))
	        JOIN `greenhouse`.`actuator` `a` ON ((`r`.`actuatorId` = `a`.`id`))
	        JOIN `greenhouse`.`pumps` `p` ON ((`r`.`pumpId` = `p`.`id`)))))
        ORDER BY
	        `readingID` ASC;
        """
        return Database.get_rows(sql)

    # INSERT reading 
    @staticmethod
    def insert_moisture_reading(datainput, sensorId, value, actuatorId, pumpId):
        params = [datainput, sensorId, value, actuatorId, pumpId]
        sql = "INSERT INTO greenhouse.reading (datainput, sensorId, value, actuatorId, pumpId) VALUES(%s, %s, %s, %s, %s)"
        Database.execute_sql(sql, params)

    @staticmethod
    def insert_short_reading(datainput, sensorId, value):
        params = [datainput, sensorId, value]
        sql = "INSERT INTO greenhouse.reading (datainput, sensorId, value) VALUES(%s, %s, %s)"
        Database.execute_sql(sql, params)

    @staticmethod
    def read_readings_by_date():
        sql = "SELECT * from greenhouse.reading where (datainput >= '2020-05-31 00:00:00' AND datainput < '2020-06-01 00:00:00') and sensorId = 1"
        params = []
        return Database.get_rows(sql,params)

    @staticmethod
    def read_readings_by_sensor(sensorid):
        sql = "SELECT * from greenhouse.reading where sensorId = %s ORDER BY id DESC LIMIT 12"
        params = [sensorid]
        return Database.get_rows(sql,params)
    
    @staticmethod
    def read_readings_by_sensor_for_plant(sensorid):
        sql = """
            SELECT 
                `r`.`id` AS `readingId`,
                `r`.`datainput` AS `datainput`,
                `r`.`sensorId` AS `sensorId`,
                `r`.`value` AS `value`,
                `a`.`id` AS `actuatorId`,
                `a`.`status` AS `actuatorStatus`
            FROM
                (((`greenhouse`.`reading` `r`
                JOIN `greenhouse`.`actuator` `a` ON ((`r`.`actuatorId` = `a`.`id`)))))
            where
                r.sensorId = %s
            ORDER BY
                readingID DESC
            LIMIT 12
        """
        params = [sensorid]
        return Database.get_rows(sql,params)

    @staticmethod
    def read_reservoir(sensorid):
        sql = "SELECT * from greenhouse.reading where sensorId = %s ORDER BY id DESC LIMIT 1"
        params = [sensorid]
        return Database.get_rows(sql,params)

    @staticmethod
    def read_actuators():
        sql = "SELECT * from greenhouse.actuator"
        params = []
        return Database.get_rows(sql,params)

    @staticmethod
    def read_latest_record_from_each_sensor():
        sql = "SELECT gr.sensorId, gr.value FROM (SELECT sensorId, max(datainput) as MaxTime  FROM greenhouse.reading  GROUP BY sensorId) r INNER JOIN greenhouse.reading  gr ON gr.sensorId = r.sensorId AND gr.datainput = r.MaxTime"
        params = []
        return Database.get_rows(sql,params)
