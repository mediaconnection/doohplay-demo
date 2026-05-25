// @ts-nocheck
import { pool } from "@/lib/db"

export async function matchOrders() {

  const buys = await pool.query(`
    select *
    from media_orders
    where side = 'buy'
    and status = 'open'
    order by price desc
  `)

  const sells = await pool.query(`
    select *
    from media_orders
    where side = 'sell'
    and status = 'open'
    order by price asc
  `)

  for (const buy of buys.rows) {

    for (const sell of sells.rows) {

      if (buy.price >= sell.price) {

        const quantity = Math.min(
          buy.quantity,
          sell.quantity
        )

        await pool.query(`
          insert into media_trades (
            buy_order,
            sell_order,
            price,
            quantity
          )
          values ($1,$2,$3,$4)
        `, [
          buy.order_id,
          sell.order_id,
          sell.price,
          quantity
        ])

        await pool.query(`
          update media_orders
          set status = 'filled'
          where order_id = $1
        `, [buy.order_id])

        await pool.query(`
          update media_orders
          set status = 'filled'
          where order_id = $1
        `, [sell.order_id])

        return {
          matched: true,
          quantity
        }

      }

    }

  }

  return { matched: false }

}
