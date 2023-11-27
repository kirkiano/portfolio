/*
Ktor controller for stocks, used in finance server.
*/
package org.kirkiano.finance.server.store.controllers

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.http.HttpStatusCode
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.util.pipeline.PipelineContext
import org.kirkiano.finance.server.store.db.DB

import org.kirkiano.finance.server.store.models.Stock
import org.kirkiano.finance.server.store.models.TradingHistory


typealias P = PipelineContext<Unit, ApplicationCall>


suspend fun P.getStock() {
    val sym: String? = call.parameters["symbol"]
    val result = sym?.let { DB.getStock(it) } ?: DB.getStocks()
    call.respond(result)
}


suspend fun P.addStock() {
    val s = call.receive<Stock>()
    DB.addStock(s)
    call.respond(HttpStatusCode.OK)
}


suspend fun P.getStockHistory() {
    val sym = call.parameters["symbol"]!!
    call.respond(DB.getStockHistory(sym))
}


suspend fun P.addStockHistory() {
    val sym = call.parameters["symbol"]!!
    val hist = call.receive<TradingHistory>()
    DB.addStockHistory(sym, hist)
    call.respond(HttpStatusCode.OK)
}
