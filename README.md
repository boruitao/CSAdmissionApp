# McGill CS Admission App

This full-stack application is implemented using Scala with the Cask micro-framework, which is simple and flexible to build and run Scala webservers. This application is meant to extract CS Master applicant's information and run computations, such as calculating the CGPA, etc. 

Main page:

<img src="https://github.com/boruitao/CSAdmissionApp/blob/master/images/main.png" width="400" height="400"> <img src="https://github.com/boruitao/CSAdmissionApp/blob/master/images/transcript.png" width="450" height="400">

Review page:

<img src="https://github.com/boruitao/CSAdmissionApp/blob/master/images/review.png" width="400" height="400">

#### Running the application
In the root directory, issue the following command:
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
