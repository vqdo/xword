package main

import (
  "log"
  "net/http"
  "os"
)

func main() {
  fs := http.FileServer(http.Dir("dist"))
  port := os.Getenv("PORT")
  if port == "" {
    port = "8888"
  }
  http.Handle("/", fs)

  log.Println("Listening on port :" + port)
  http.ListenAndServe(":" + port, nil)
}
