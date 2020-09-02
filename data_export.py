import sqlite3
from sqlite3 import Error
import csv
import os, shutil
from os import path
import sys, getopt

output_dir = "output"
access_rights = 0o755
def createDirIfNotExist(filename):
    file_path = os.path.join(output_dir, filename)
    if not path.exists(file_path):
        try:
            os.mkdir(file_path, access_rights)
        except OSError:
            print ("Creation of the directory %s failed" % file_path)
        else:
            print ("Successfully created the directory %s" % file_path)

def create_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)

    return conn

def insert(conn, entity, data):
    cur = conn.cursor()
    insert_query = "INSERT INTO " + entity + " VALUES " + data
    cur.execute(insert_query)

def execute_query(conn, query, file):
    cur = conn.cursor()
    cur.execute(query)
    
    with open(file, "w", newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow([i[0] for i in cur.description])
        csv_writer.writerows(cur)
    
    print("query execution successful and output redirected to file %s" % file)

def print_all(conn, entity):
    cur = conn.cursor()
    cur.execute("SELECT * FROM "+ entity)
    rows = cur.fetchall()
    if len(rows) == 0:
        print("no record is found when executing: " + "SELECT * FROM "+ entity)
    else:
        for row in rows:
            print(row)

def main(argv):
    database = r"/var/folders/3s/m78ym4cx27jd8d5hw2z25fxh0000gn/T/gpa-calculator-cask-sqlite9985577446147267207/file.db"
    create_data = 0
    try:
        opts, args = getopt.getopt(argv,"i")
    except getopt.GetoptError:
        print('Please use the -i option to create data and execute queries')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-i':
            create_data = 1
            print("creating data in the database")
        else:
            sys.exit(2)
        
    # create a database connection
    conn = create_connection(database)
    with conn:
        student_data = ("(\"tom\", \"tao\", 26067, \"tom.tao@gmail.com\", 1)," 
                        "(\"Jerry\", \"Ran\", 27077, \"jerry.ran@gmail.com\", 2),"
                        "(\"taylor\", \"swift\", 28088, \"taylor.swift@gmail.com\", 3)," 
                        "(\"kobe\", \"bryant\", 29999, \"kobe@hotmail.com\", 4),"
                        "(\"lebron\", \"james\", 24407, \"lbj@qq.com\", 5)," 
                        "(\"Leo\", \"Messi\", 25502, \"leomessi@lol.com\", 6);")
        transcript_data = ("(1, \"B.Sc.\", \"2019\", \"china\", \"qinghua\")," 
                            "(1, \"B.Sc.\", \"2018\",\"canada\", \"trt\"),"
                            "(1, \"B.Eng.\", \"2017\",\"usa\", \"harward\")," 
                            "(2, \"B.Sc.\", \"2019\",\"usa\", \"stanford\")," 
                            "(2, \"M.Sc.\", \"2018\",\"canada\", \"ubc\"),"
                            "(3, \"B.Sc.\", \"2020\",\"china\", \"peiking\")," 
                            "(3, \"B.Eng.\",\"2016\", \"japan\", \"uofkyoto\"),"
                            "(3, \"M.Sc.\", \"2018\",\"usa\", \"ucb\")," 
                            "(3, \"M.Sc.\",\"2019\", \"australia\", \"blah\"),"
                            "(4, \"B.Sc.\",\"2017\", \"china\", \"nanjingu\")," 
                            "(4, \"B.Eng.\",\"2019\",\"usa\", \"MIT\")," 
                            "(4, \"M.Sc.\",\"2016\", \"uk\", \"oxford\"),"
                            "(5, \"B.Eng.\",\"2015\", \"canada\", \"uoa\")," 
                            "(6, \"B.Sc.\",\"2019\", \"usa\", \"bostonu\")," 
                            "(6, \"M.Sc.\",\"2018\", \"korea\", \"uofkorea\");")
        course_data = ("(1, \"compsci1\", \"COMP250\", 3, 3.2),"
                        "(1, \"compsci2\", \"COMP251\", 4, 3.6),"
                        "(2, \"compsci3\", \"ECSE202\", 2, 2.7),"
                        "(2, \"compsci4\", \"PHYS253\", 1, 4.0),"
                        "(3, \"compsci5\", \"HIST254\", 3, 3),"
                        "(3, \"compsci6\", \"COMP255\", 3, 3.3),"
                        "(4, \"compsci7\", \"ECSE256\", 4, 3.7),"
                        "(4, \"compsci8\", \"MUSI257\", 3, 3.8),"
                        "(5, \"compsci1\", \"MATH250\", 3, 3.2),"
                        "(6, \"compsci2\", \"EDUC251\", 4, 3.6),"
                        "(7, \"compsci3\", \"MECH252\", 2, 2.7),"
                        "(8, \"compsci4\", \"ECSE253\", 1, 4.0),"
                        "(9, \"compsci5\", \"COMP254\", 3, 3),"
                        "(10, \"compsci6\", \"LATI355\", 3, 3.3),"
                        "(11, \"compsci7\", \"INDI256\", 4, 3.7),"
                        "(12, \"compsci8\", \"FREN257\", 3, 3.8),"
                        "(13, \"compsci1\", \"ECSE250\", 3, 3.2),"
                        "(14, \"compsci2\", \"COMP251\", 4, 3.6),"
                        "(14, \"compsci3\", \"COMP252\", 2, 2.7),"
                        "(14, \"compsci4\", \"COMP253\", 1, 4.0),"
                        "(15, \"compsci5\", \"ECSE254\", 3, 3),"
                        "(15, \"compsci6\", \"ECSE255\", 3, 3.3),"
                        "(15, \"compsci7\", \"ECSE256\", 4, 3.7),"
                        "(15, \"compsci8\", \"ECSE257\", 3, 3.8)")
        if create_data == 1:
            print("Inserting data")
            insert(conn, "student (firstname, lastname, mid, email, creationtime)", student_data)
            insert(conn, "transcript (sid, degree, gradyear, country, university)", transcript_data)
            insert(conn, "course (tid, coursename, coursecode, credit, grade)", course_data)
        
        # new_data = ("(1, \"ecse\", \"250\", 3, 3.2),"
        #                 "(1, \"ecse1\", \"251\", 4, 3.6),"
        #                 "(2, \"ecse2\", \"252\", 2, 2.7),"
        #                 "(2, \"ecse3\", \"253\", 1, 4.0),"
        #                 "(3, \"ecse4\", \"254\", 3, 3),"
        #                 "(3, \"ecse5\", \"255\", 3, 3.3),"
        #                 "(4, \"ecse6\", \"256\", 4, 3.7),"
        #                 "(4, \"ecse7\", \"257\", 3, 3.8)")
        # insert(conn, "course (tid, coursename, coursecode, credit, grade)", new_data)
        print("Query all data")
        print_all(conn, "student")
        print_all(conn, "transcript")
        print_all(conn, "course")

        print("executing the query")
        query_str = ("select sid, firstname, lastname, mid, avg(cgpa) filter (where row = 1) trans1_cgpa,"
                    "group_concat(degree) filter (where row = 1) trans1_degree,"
                    "group_concat(gradyear) filter (where row = 1) trans1_gradyear,"
                    "group_concat(country) filter (where row = 1) trans1_country,"
                    "group_concat(university) filter (where row = 1) trans1_university,"
                    "avg(cgpa) filter (where row = 2) trans2_cgpa,"
                    "group_concat(degree) filter (where row = 2) trans2_degree,"
                    "group_concat(gradyear) filter (where row = 2) trans2_gradyear,"
                    "group_concat(country) filter (where row = 2) trans2_country,"
                    "group_concat(university) filter (where row = 2) trans2_university,"
                    "avg(cgpa) filter (where row = 3) trans3_cgpa, "
                    "group_concat(degree) filter (where row = 3) trans3_degree,"
                    "group_concat(gradyear) filter (where row = 3) trans3_gradyear,"
                    "group_concat(country) filter (where row = 3) trans3_country,"
                    "group_concat(university) filter (where row = 3) trans3_university,"
                    "avg(cgpa) filter (where row = 4) trans4_cgpa,"
                    "group_concat(degree) filter (where row = 4) trans4_degree,"
                    "group_concat(gradyear) filter (where row = 4) trans4_gradyear,"
                    "group_concat(country) filter (where row = 4) trans4_country,"
                    "group_concat(university) filter (where row = 4) trans4_university from ("
                    "select sid, firstname, lastname, mid, degree, gradyear, university, country, ROW_NUMBER() over(partition by sid order by tid) row, tid, cgpa from ("
                    "select t.sid, t.tid, cgpa, firstname, lastname, mid, gradyear, degree, university, country from transcript t left outer join ("
                    "select tid, sum(grade * credit) / sum(credit) as cgpa from course "
                    "group by tid "
                    ")l on l.tid = t.tid "
                    "left outer join student s on s.sid = t.sid ) "
                    ") group by sid")
        execute_query(conn, query_str, os.path.join(output_dir,"cgpa_per_student.csv"))
        
        # produce one csv file per student:
        cur = conn.cursor()
        cur.execute("SELECT sid, firstname, lastname FROM student")
        student_info = [(tup[0], tup[1], tup[2]) for tup in cur.fetchall()]

        for student in student_info:
            sfile_name = str(student[0]) + "_" + student[1] + "_" + student[2]
            createDirIfNotExist(sfile_name)
            cur.execute("SELECT tid, degree, gradyear, country, university, sid FROM transcript WHERE sid = {my_sid}".\
                    format(my_sid=student[0]))
            trans_info = [(tup[0], tup[1], tup[2], tup[3], tup[4]) for tup in cur.fetchall()]
            for trans in trans_info:
                tfile_name = str(trans[0]) + "_" + str(trans[1]) + "_" + str(trans[2]) + "_" + trans[3] + "_" + trans[4] + ".csv"
                tfile_path = os.path.join(output_dir, sfile_name,tfile_name)
                query = "SELECT * from course where tid = {my_tid}".format(my_tid=trans[0])
                execute_query(conn, query, tfile_path)

if __name__ == '__main__':
   main(sys.argv[1:])