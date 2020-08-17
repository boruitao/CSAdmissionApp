scalaVersion := "2.13.2"

// name := "app"
// organization := "ch.epfl.scala"
// version := "1.0"

Compile / scalaSource := baseDirectory.value / "src/main/scala"
Test / scalaSource := baseDirectory.value / "src/test"

libraryDependencies += "com.github.japgolly.scalacss" %% "ext-scalatags" % "0.6.1"

libraryDependencies += "org.scala-js" %% "scalajs-dom_sjs1" % "1.0.0"

libraryDependencies ++= Seq(
  "org.xerial" % "sqlite-jdbc" % "3.30.1",
  "io.getquill" %% "quill-jdbc" % "3.5.2"
)

libraryDependencies += "com.lihaoyi" %% "cask" % "0.6.7"

libraryDependencies += "ch.qos.logback" % "logback-classic" % "1.1.3" % Runtime

libraryDependencies += "com.lihaoyi" %% "utest" % "0.7.2" % "test"

testFrameworks += new TestFramework("utest.runner.Framework")