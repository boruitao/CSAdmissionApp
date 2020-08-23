import sqlite3
from sqlite3 import Error
import csv

def create_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)

    return conn


def select_all(conn, entity):
    cur = conn.cursor()
    cur.execute("SELECT * FROM "+ entity)

    rows = cur.fetchall()

    for row in rows:
        print(row)

def write_all_tocsv(conn, entity, output):
    cur = conn.cursor()
    cur.execute("SELECT * FROM " + entity)

    with open(output, "w", newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow([i[0] for i in cur.description])
        csv_writer.writerows(cur)


def select_task_by_priority(conn, priority):
    """
    Query tasks by priority
    :param conn: the Connection object
    :param priority:
    :return:
    """
    cur = conn.cursor()
    cur.execute("SELECT * FROM transcript WHERE priority=?", (priority,))

    rows = cur.fetchall()

    for row in rows:
        print(row)


def main():
    database = r"/var/folders/3s/m78ym4cx27jd8d5hw2z25fxh0000gn/T/gpa-calculator-cask-sqlite3227867811220165632/file.db"

    # create a database connection
    conn = create_connection(database)
    with conn:
        print("Query all students")
        select_all(conn, "student")

        print("write to csv")
        write_all_tocsv(conn, "student", "student.csv")

        print("Query all transcripts")
        select_all(conn, "transcript")

        print("write to csv")
        write_all_tocsv(conn, "transcript", "transcript.csv")

        print("Query all entries")
        select_all(conn, "entry")

        print("write to csv")
        write_all_tocsv(conn, "entry", "entry.csv")


if __name__ == '__main__':
    main()