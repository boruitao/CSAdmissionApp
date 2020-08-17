package app
import com.typesafe.config.ConfigFactory
import io.getquill.{SnakeCase, SqliteJdbcContext}
import scalatags.Text.all.{input, _}
import scalatags.Text.tags2
import upickle.default._
//import org.scalajs.sbtplugin.ScalaJSPlugin.AutoImport._

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

  case class Student(sid: String, name: String, mid: String, email: String, gpa: Float, gre: Int)

  case class Transcript(tid: String, sid: String, university: String, country: String)
  
  case class Entry(eid: String, tid: String, coursecode: String, coursename: String, credit: Int, grade: String)
  
  implicit val studentRW = upickle.default.macroRW[Student]

  implicit val transcriptRW = upickle.default.macroRW[Transcript]

  implicit val entryRW = upickle.default.macroRW[Entry]

  ctx.executeAction(
    """CREATE TABLE student (
  sid VARCHAR(10) PRIMARY KEY,
  name TEXT NOT NULL,
  mid VARCHAR(15) NOT NULL,
  email TEXT NOT NULL,
  gpa FLOAT(2) NOT NULL,
  gre INTEGER
);
""".stripMargin
  )
  ctx.executeAction(
    """CREATE TABLE transcript (
  tid VARCHAR(10) PRIMARY KEY,
  sid VARCHAR(10) NOT NULL,
  university VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL,
  FOREIGN KEY(sid) REFERENCES student(sid)
);
""".stripMargin
  )
  ctx.executeAction(
    """CREATE TABLE entry (
  eid VARCHAR(10) PRIMARY KEY,
  tid VARCHAR(10) NOT NULL,
  coursecode VARCHAR(50) NOT NULL,
  coursename TEXT NOT NULL,
  credit INTEGER NOT NULL, 
  grade VARCHAR(10) NOT NULL,
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
    val sid = student.sid
    val mid = student.mid
    val email = student.email
    val name = student.name
    val gpa = student.gpa
    val gre = student.gre

    run(
      query[Student]
        //.insert(_.sid -> lift(parsed.sid), _.email -> lift(parsed.email), _.name -> lift(parsd.name))
        .insert(_.sid -> lift(sid), _.mid -> lift(mid), _.email -> lift(email), _.name -> lift(name), _.gpa -> lift(gpa), _.gre -> lift(gre))
       // .returningGenerated(_.sid)
    )
    
//    val transcriptlll = upickle.default.read[Transcript](data("transcripts")(0)("trans_info"))

    val numTrans = data("transcripts").arr.length
    println("number of trans: %d", numTrans)
    for(i <- 0 to numTrans-1){
        val transcript = upickle.default.read[Transcript](data("transcripts")(0)("trans_info"))
        val uni = transcript.university
        val country = transcript.country
        val tid = transcript.tid
        run(
          query[Transcript]
            .insert(_.tid -> lift(tid), _.sid -> lift(sid), _.university -> lift(uni), _.country -> lift(country))
        )

       val numEntries = data("transcripts")(i)("trans_table").arr.length
       for(j <- 0 to numEntries-1){
           val entry = upickle.default.read[Entry](data("transcripts")(0)("trans_table")(0))
           val eid = entry.eid
           val coursecode = entry.coursecode
           val coursename = entry.coursename
           val grade = entry.grade
           val credit = entry.credit
           run(
            query[Entry]
              .insert(_.eid -> lift(eid), _.tid -> lift(tid), _.coursecode -> lift(coursecode), _.coursename -> lift(coursename),_.grade -> lift(grade),_.credit -> lift(credit))
          )
       }
   }
    // val transcript = upickle.default.read[Transcript](data(0)("transcript"))
    
    
    // val tid = transcript.tid
    // val uni = transcript.university
    // val country = transcript.country

    println("You typed: %s", sid)
    println("You typed: %s", email)
    println("You typed: %s", name)
    println("You typed: %s", gpa)
    println("You typed: %s", gre)
    
    renderSuccessMessage(state).render
  }

  def renderTranscript() = {
    frag(
      div(cls := "single-trans",
        div(cls := "transcript-info-header",
          h3("Student's Undergrad Transcript")
        ),
        div(cls
          := "transcript",
          div(cls := "trans-info-div",
            div(cls := "uni-div", 
              label("University"),
              input(cls := "uni", `type` := "text", autofocus := "")
            ),
            div(cls := "country-div", 
              label("Country"),
              input(cls := "country", `type` := "text", autofocus := "")
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
                th("Grade")
              )
            ),
            tbody(cls := "trans-table-body",
              tr(cls := "table-head-row",
                td(input(cls := "ccode-entry", `type` := "text", placeholder :="Ex:COMP250")),
                td(input(cls := "cname-entry", `type` := "text", placeholder :="Ex:Intro. to Computer Science")),
                td(input(cls := "credit-entry", `type` := "text", placeholder :="Ex:3")),
                td(input(cls := "grade-entry", `type` := "text", placeholder :="Ex:A"))
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
        div(cls := "general-info", 
          div(cls := "name-div",
            label("Full Name"),
            input(cls := "new-student-name", placeholder := "What is your name?", `type` := "text", autofocus := ""),
            p(cls := "invalid-name")
          ),
          div(cls := "mid-div",
            label("McGill ID"),
            input(cls := "new-student-mid", placeholder := "What is your McGill id?", `type` := "text", autofocus := ""),
            p(cls := "invalid-mid")
          ),
          div(cls := "email-div",
            label("McGill Email"),
            input(cls := "new-student-email", placeholder := "What is your McGill email?", `type` := "text", autofocus := ""),
            p(cls := "invalid-email")
          ),
          div(cls := "gpa-div",
            label("Student's GPA"),
            input(cls := "new-student-gpa", placeholder := "What is your undergrad GPA?", `type` := "text", autofocus := ""),
            p(cls := "invalid-gpa")
          ),
          div(cls := "gre-div",
            label("Student's GRE Score"),
            input(cls := "new-student-gre", placeholder := "What is your gre score?", `type` := "text", autofocus := ""),
            p(cls := "invalid-gre")
          )
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
//      tags2.section(cls := "main",
//        input(
//          id := "toggle-all",
//          cls := "toggle-all",
//          `type` := "checkbox",
//          if (run(query[Todo].filter(_.checked).size != 0)) checked else ()
//        ),
//        label(`for` := "toggle-all","Mark all as complete"),
//        ul(cls := "todo-list",
//          for(todo <- filteredTodos) yield li(
//            if (todo.checked) cls := "completed" else (),
//            div(cls := "view",
//              input(
//                cls := "toggle",
//                `type` := "checkbox",
//                if (todo.checked) checked else (),
//                data("todo-index") := todo.id
//              ),
//              label(todo.text),
//              button(cls := "destroy", data("todo-index") := todo.id)
//            ),
//            input(cls := "edit", value := todo.text)
//          )
//        )
//      ),
      footer(cls := "footer"
//        span(cls := "todo-count",
//          strong(run(query[Todo].filter(!_.checked).size).toInt),
//          " items left"
//        ),
//        ul(cls := "filters",
//          li(cls := "todo-all",
//            a(if (state == "all") cls := "selected" else (), "All")
//          ),
//          li(cls := "todo-active",
//            a(if (state == "active") cls := "selected" else (), "Active")
//          ),
//          li(cls := "todo-completed",
//            a(if (state == "completed") cls := "selected" else (), "Completed")
//          )
//        ),
        
      )
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
//          footer(cls := "info",
//            p("Double-click to edit a todo"),
//            p("Created by ",
//              a(href := "http://todomvc.com","Li Haoyi")
//            ),
//            p("Part of ",
//              a(href := "http://todomvc.com","TodoMVC")
//            )
//          ),
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