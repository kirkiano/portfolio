# Separation of concerns

If we were pressed to boil software engineering down to one principle, or to
identify the most important one of its best practices, we might well choose
_separation of concerns_. Its influence is seen at all levels of our craft,
from the "highest," as in the division of a back end into a distribution of
single-purpose microservices, to the "lowest," as in the splitting of an
overlong function into smaller ones. The operation is always the same: some
chunk of the system, sometimes a "confused" one, is broken down into pieces
that are then logically _composed_. And because these components are now
independent, they have become easier to test, easier to reason about, and
easier to improve.

Notes in this collection that discuss the principle include:
* [Log wrapper](log_wrapper/article.md)
* [This portfolio](this_portfolio.md)
