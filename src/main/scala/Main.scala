package app
import com.typesafe.config.ConfigFactory
import io.getquill.{SnakeCase, SqliteJdbcContext}
import scalatags.Text.all.{input, _}
import scalatags.Text.tags2
import java.io.File 
import java.util.Arrays
import scala.io.Source
import upickle.default._

object TodoServer extends cask.MainRoutes{
  val tmpDb = java.nio.file.Files.createTempDirectory("gpa-calculator-cask-sqlite")

  object ctx extends SqliteJdbcContext(
    SnakeCase,
    ConfigFactory.parseString(
      s"""{"driverClassName":"org.sqlite.JDBC","jdbcUrl":"jdbc:sqlite:$tmpDb/file.db"}"""
    )
  )

  class transactional extends cask.RawDecorator{
    class TransactionFailed(val value: cask.router.Result.Error) extends Exception
    def wrapFunction(pctx: cask.Request, delegate: Delegate) = {
      try ctx.transaction(
        delegate(Map()) match{
          case cask.router.Result.Success(t) => cask.router.Result.Success(t)
          case e: cask.router.Result.Error => throw new TransactionFailed(e)
        }
      )
      catch{case e: TransactionFailed => e.value}
    }
  }

  // case class Student(sid: Int, firstname: String, lastname: String, mid: String, email: String, 
  //   tlisten: Int, tread: Int, tspeak: Int, twrite: Int, gverbal: Int, gquant: Int, gwrite: Float)
  case class Student(sid: Int, firstname: String, lastname: String, mid: String, email: String, creationtime: Float)

  case class Transcript(tid: Int, sid: Int, degree: String, university: String, country: String)
  
  case class Entry(eid: Int, tid: Int, coursecode: String, coursename: String, credit: Float, grade: Float)
  
  implicit val studentRW = upickle.default.macroRW[Student]

  implicit val transcriptRW = upickle.default.macroRW[Transcript]

  implicit val entryRW = upickle.default.macroRW[Entry]

//   insert toefl and gre score
//   ctx.executeAction(
//     """CREATE TABLE student (
//   sid INTEGER PRIMARY KEY AUTOINCREMENT,
//   firstname TEXT NOT NULL,
//   lastname TEXT NOT NULL,
//   mid VARCHAR(15) NOT NULL,
//   email TEXT NOT NULL,
//   tlisten INTEGER,
//   tread INTEGER,
//   tspeak INTEGER,
//   twrite INTEGER,
//   gverbal INTEGER,
//   gquant INTEGER,
//   gwrite FLOAT(10, 2)
// );
// """.stripMargin
//   )
  ctx.executeAction(
      """CREATE TABLE student (
    sid INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    mid VARCHAR(15) NOT NULL,
    email TEXT NOT NULL,
    creationtime FLOAT(20) NOT NULL
  );
  """.stripMargin
  )

  ctx.executeAction(
    """CREATE TABLE transcript (
  tid INTEGER PRIMARY KEY AUTOINCREMENT,
  sid INTEGER NOT NULL,
  degree VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL,
  university VARCHAR(50) NOT NULL,
  FOREIGN KEY(sid) REFERENCES student(sid)
);
""".stripMargin
  )
  ctx.executeAction(
    """CREATE TABLE entry (
  eid INTEGER PRIMARY KEY AUTOINCREMENT,
  tid INTEGER NOT NULL,
  coursecode VARCHAR(50) NOT NULL,
  coursename TEXT NOT NULL,
  credit FLOAT(10, 2) NOT NULL, 
  grade FLOAT(10, 2) NOT NULL,
  FOREIGN KEY(tid) REFERENCES transcript(tid)
);
""".stripMargin
  )

  import ctx._

  @transactional
  @cask.post("/add/:state")
  def add(state: String, request: cask.Request) = {
    val body = request.text()
    val data = ujson.read(body)
    println("You student: %s", data("student"))
    println("You trans: %s", data("transcripts"))
    val student = upickle.default.read[Student](data("student"))
    // val studentq = quote {
    //   query[Student]
    //     .insert(_.mid -> lift(student.mid), _.email -> lift(student.email), _.firstname -> lift(student.firstname),
    //        _.lastname -> lift(student.lastname),_.tlisten -> lift(student.tlisten),_.tread -> lift(student.tread), _.tspeak -> lift(student.tspeak),
    //        _.twrite -> lift(student.twrite), _.gverbal -> lift(student.gverbal),  _.gquant -> lift(student.gquant), _.gwrite -> lift(student.gwrite))
    //     .returningGenerated(_.sid)
    // }
    val studentq = quote {
      query[Student]
        .insert(_.mid -> lift(student.mid), _.email -> lift(student.email), _.firstname -> lift(student.firstname),
           _.lastname -> lift(student.lastname), _.creationtime -> lift(student.creationtime))
        .returningGenerated(_.sid)
    }
    val sid = ctx.run(studentq)
    val numTrans = data("transcripts").arr.length
    println("number of trans: %d", numTrans)
    for(i <- 0 to numTrans-1){
        val trans = upickle.default.read[Transcript](data("transcripts")(i)("trans_info"))
        val transq = quote {
          query[Transcript]
            .insert(_.sid -> lift(sid), _.degree -> lift(trans.degree),
                _.university -> lift(trans.university), _.country -> lift(trans.country))
            .returningGenerated(_.tid)
        }
        val tid = ctx.run(transq)

       val numEntries = data("transcripts")(i)("trans_table").arr.length
       for(j <- 0 to numEntries-1){
           val entry = upickle.default.read[Entry](data("transcripts")(i)("trans_table")(j))
           val coursecode = entry.coursecode
           val coursename = entry.coursename
           val grade = entry.grade
           val credit = entry.credit
           run(
            query[Entry]
              .insert(_.tid -> lift(tid), _.coursecode -> lift(coursecode),
               _.coursename -> lift(coursename),_.grade -> lift(grade),_.credit -> lift(credit))
               .returningGenerated(_.eid)
          )
       }
    }
    println("Rendering the success page")
    renderSuccessMessage(state).render
  }

  def getListOfFiles(f: File):List[File] = {
    if (f.exists && f.isDirectory) {
        f.listFiles.filter(_.isFile).toList
    } else {
        List[File]()
    }
  }

  def getHTMLContent(f: String):String ={
    val lines = Source.fromFile(f).getLines.toArray
    lines.mkString("")
  }

  def renderTranscript() = {
    frag(
      div(cls := "single-trans",
        div(cls := "transcript-info-header",
          h3("Student's Transcript")
        ),
        div(cls
          := "transcript",
          div(cls := "trans-info-div",
            div(cls := "degree-div", 
              label("Degree", span(cls := "red-star", "*")),
              select(cls := "degree-select",
                option(value := "B.Sc.", "B.Sc."),
                option(value := "B.Eng.", "B.Eng."),
                option(value := "M.Sc.", "M.Sc."),
                option(value := "M.Eng.", "M.Eng.")
              )
            ),
            div(cls := "uni-div", 
              label("University", span(cls := "red-star", "*")),
              input(cls := "uni", `type` := "text", autofocus := "")
            ),
            p(cls := "invalid-uni"),
            div(cls := "country-div", 
              label("Country", span(cls := "red-star", "*")),
              select(cls := "country",
                option(value := "-", "-"),
                for(countryname <- getListOfFiles(new File("./resources/gpacal/html")).sortWith(_.getName()<_.getName())) yield option(
                  value := countryname.getName().substring(0, countryname.getName().indexOf(".html")).toLowerCase(),
                  attr("htmlcontent") := getHTMLContent("./resources/gpacal/html/"+countryname.getName()),
                  countryname.getName().substring(0, countryname.getName().indexOf(".html")).toLowerCase()
                )
              )
              //input(cls := "country", `type` := "text", autofocus := "")
            ),
            p(cls := "invalid-country"),
            div(cls := "gpa-scale",
              label(cls := "gpa-scale-label"),
              div(cls := "gpa-scale-table-div"
              )
            )
          ),
          renderTable()
        )
      )
    )
  }

  def renderTable() = {
    val addbutton = button(cls := "add-trans","Add a transcript below").render
    frag(
      div(cls := "trans-table-div",
          table(cls := "trans-table",
            thead(cls := "trans-table-head", 
              tr(cls := "table-head-row",
                th("Course Code"),
                th(cls := "cname-th", "Course Name"),
                th("Credit"),
                th("Grade (4.0 scale)")
              )
            ),
            tbody(cls := "trans-table-body",
              tr(cls := "table-head-row",
                td(input(cls := "ccode-entry", `type` := "text", placeholder :="Ex:COMP250")),
                td(input(cls := "cname-entry", `type` := "text", placeholder :="Ex:Intro. to Computer Science")),
                td(input(cls := "credit-entry", `type` := "text", placeholder :="Ex:3")),
                td(input(cls := "grade-entry", `type` := "text", placeholder :="Ex:4"))
              ),
              tr(cls := "table-head-row",
                td(input(cls := "ccode-entry", `type` := "text")),
                td(input(cls := "cname-entry", `type` := "text")),
                td(input(cls := "credit-entry", `type` := "text")),
                td(input(cls := "grade-entry", `type` := "text"))
              ),
              tr(cls := "table-head-row",
                td(input(cls := "ccode-entry", `type` := "text")),
                td(input(cls := "cname-entry", `type` := "text")),
                td(input(cls := "credit-entry", `type` := "text")),
                td(input(cls := "grade-entry", `type` := "text"))
              ),
              tr(cls := "table-head-row",
                td(input(cls := "ccode-entry", `type` := "text")),
                td(input(cls := "cname-entry", `type` := "text")),
                td(input(cls := "credit-entry", `type` := "text")),
                td(input(cls := "grade-entry", `type` := "text"))
              ),
              tr(cls := "table-head-row",
                td(input(cls := "ccode-entry", `type` := "text")),
                td(input(cls := "cname-entry", `type` := "text")),
                td(input(cls := "credit-entry", `type` := "text")),
                td(input(cls := "grade-entry", `type` := "text"))
              )
            )
          ),
          p(cls := "invalid-table"),
          div(cls := "add-row-button-div",
            button(cls := "addrow","add 3 more rows")
          ),
          hr(cls := "grey-hr")
        )
    )
  }

  def renderSuccessMessage(state: String) = {
    // var srecords = run(query[Student])
    // var trecords = run(query[Transcript])

    frag(
      header(cls := "header",
        div(cls := "header-wrapper",
          div(cls := "logo-wrapper", 
            img(src := "/static/logo.png")
          ),
          div(cls := "master-title", 
            ("Computer Science Master Admission")
          ),
          div(cls := "school-title", 
            ("McGill University")
          )
        ),
        hr(cls := "red-hr")
      ),
      div(cls := "message", 
        h3("Your have successfully entered your information!")
      )
    )
  }

  def renderBody(state: String) = {
    frag(
      header(cls := "header",
        div(cls := "header-wrapper",
          div(cls := "logo-wrapper", 
            img(src := "/static/logo.png")
          ),
          div(cls := "master-title", 
            ("Computer Science Master Admission")
          ),
          div(cls := "school-title", 
            ("McGill University")
          )
        ),
        hr(cls := "red-hr")
      ),
      tags2.section(cls := "main",
        div(cls := "general-info-header",
         h3("Student's General Information")
        ),
        div(id := "general-info", 
          div(cls := "name-div",
            div(cls := "first-name-div",
              label("First Name", span(cls := "red-star", "*")),
              input(cls := "student-first-name", `type` := "text", autofocus := ""),
            ),
            div(cls := "last-name-div",
              label("Last Name", span(cls := "red-star", "*")),
              input(cls := "student-last-name", `type` := "text", autofocus := ""),
            ),
            p(cls := "invalid-name")
          ),
          div(cls := "mid-div",
            label("UApply/McGill ID", span(cls := "red-star", "*")),
            input(cls := "new-student-mid", placeholder := "What is your McGill id?", `type` := "text", autofocus := ""),
            p(cls := "invalid-mid")
          ),
          div(cls := "email-div",
            label("Email", span(cls := "red-star", "*")),
            input(cls := "new-student-email", placeholder := "What is your email?", `type` := "text", autofocus := ""),
            p(cls := "invalid-email")
          )
        //   div(cls := "toefl-div",
        //     label("Student's TOEFL Score"),
        //     table(cls := "toefl-table",
        //       thead(cls := "toefl-table-head", 
        //         tr(cls := "table-head-row",
        //           th("listening"),
        //           th("reading"),
        //           th("speaking"),
        //           th("writing")
        //          // th("total")
        //         )
        //       ),
        //       tbody(cls := "toefl-table-body",
        //         tr(cls := "table-head-row",
        //           td(input(cls := "toefl-listening", `type` := "text", autofocus := "")),
        //           td(input(cls := "toefl-reading", `type` := "text", autofocus := "")),
        //           td(input(cls := "toefl-speaking", `type` := "text", autofocus := "")),
        //           td(input(cls := "toefl-writing", `type` := "text", autofocus := "")),
        //         //  td(p(cls := "toefl-total", getToeflTotal()))
        //         )
        //       )
        //     ),
        //     p(cls := "invalid-toefl")
        //   ),
        //   div(cls := "gre-div",
        //     label("Student's GRE Score"),
        //     table(cls := "gre-table",
        //       thead(cls := "gre-table-head", 
        //         tr(cls := "table-head-row",
        //           th("verbal"),
        //           th("quantitative"),
        //           th("analytical writing"),
        //         )
        //       ),
        //       tbody(cls := "gre-table-body",
        //         tr(cls := "table-head-row",
        //           td(input(cls := "gre-verbal", `type` := "text", autofocus := "")),
        //           td(input(cls := "gre-quant", `type` := "text", autofocus := "")),
        //           td(input(cls := "gre-writing", `type` := "text", autofocus := "")),
        //         )
        //       )
        //     ),          
        //     p(cls := "invalid-gre")
        //   )
        ),
        hr(cls := "red-hr"),
        div(id := "transcripts-div",
          ul(id := "transcripts",
            li(renderTranscript())
          )
        ),
        div(cls := "add-remove-div",
          div(cls := "add-trans-button", 
            button(cls := "add-trans", "Add a transcript")
          ),
          div(cls := "remove-trans-button", 
            button(cls := "remove-trans","Remove last transcript")
          )
        ),
        div(cls := "review-button", 
          button(cls := "review","Review")
        )
      ),

      footer(cls := "footer")
    )
  }

  @transactional
  @cask.get("/")
  def index() = {
    cask.Response(
      html(lang := "en",
        head(
          meta(charset := "utf-8"),
          meta(name := "viewport", content := "width=device-width, initial-scale=1"),
          tags2.title("Student • GPA_CALCULATOR"),
          link(rel := "stylesheet", href := "/static/style.css")
        ),
        body(
          tags2.section(cls := "gpa-calculator", renderBody("all")),
          script(src := "/static/app.js")
        )
      )
    )
  }

  // @cask.staticResources("/static")
  // def static() = "todo"
  @cask.staticFiles("/static")
  def static() = "resources/gpacal/"

  initialize()
}