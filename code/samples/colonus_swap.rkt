#lang racket/base

#|
Swap feature of Colonus, the homegrown cloud configuration/deployment
tool I wrote to replace Ansible.
|#

(provide swap-file)

(require "../core/all.rkt")


(define (already-swapping? remote-file)
  (let* ([cmd (format "grep ~a /proc/swaps" remote-file)])
    (zero? (remote-command cmd 0 1))))


(define (allocate-swap-file remote-file size-in-megs)
  (if (remote-file-exists? remote-file)
      (log swap already created remote-file)
      (let* ([dd-fmt "dd if=/dev/zero of=~a bs=1048576 count=~a"]
             [dd-cmd (format dd-fmt remote-file size-in-megs)])
        (remote-command dd-cmd)
        (chmod remote-file '0600)
        (log swap now created remote-file))))


(define (mkswap remote-file)
  (let* ([cmd (format "mkswap ~a" remote-file)])
    ;; expecting an exit code of 0 or 1 makes the
    ;; remote command effectively idempotent
    (remote-command cmd 0 1)))


(define (swapon remote-file)
  (let* ([cmd (format "swapon ~a" remote-file)])
    ;; expecting an exit code of 0 or 1 makes the
    ;; remote command effectively idempotent
    (remote-command cmd)))


(define-syntax swap-file
  (syntax-rules ()
    ((_ remote-file size-in-megs)
     (if (already-swapping? remote-file)
         (log swap already swapping remote-file)
         (begin (allocate-swap-file remote-file size-in-megs)
                (mkswap remote-file)
                (swapon remote-file)
                (log swap now swapping remote-file))))))
