/*
main.c of log-away, my log shipper. It conveys whatever it
reads from stdin to the remote logging machine.
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <errno.h>

#include "log.h"
#include "error.h"
#include "settings.h"
#include "fifo.h"
#include "socket.h"


void run(size_t, int);


int main(int argc, const char* argv[]) {
    int sock;
    Settings s;

    LOG_FP = stdout;
    LOG_LEVEL = 0;

    s = get_settings(argc, argv);
    LOG_LEVEL = s.log_level;
    print_settings(stdout, &s);

    sock = connect_to_remote_server(s.remote_host, s.remote_port);
    loggit(INFO, "main", "Connected to %s:%d", s.remote_host, s.remote_port);

    run(s.max_msg_len, sock);
    return 0;
}


void run(size_t max_msg_len, int to) {
  char *msg = malloc(max_msg_len);

    while (fgets(msg, max_msg_len, stdin)) {
        if (write_msg(to, msg) == 0) continue;
        else bail(EXIT_FAILURE, "run",
                 "could not transfer to socket: %s", strerror(errno));
    }
    loggit(INFO, "run", "No more stuff to read");
}
