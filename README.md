# GPACalculator

To run this app, in the root directory, issue the following command:
```
sudo sbt "~run"
```

Then this application is run at localhost:8080

To calculate the student's cgpa per transcript, issue the following command:
```
python data_export.py
```
The csv files will be created in the output folder. If there is no data in the database, the above command will produce no output. Use the -i option to produce sample data and execute queries:
```
python data_export.py -i
```

Note: in data_export.py, make sure to change the path to the database that is in use at line 56 in the main method.
