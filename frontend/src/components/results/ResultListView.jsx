import React from 'react'
import { ResultItemView } from './ResultItemView'
import styles from './ResultListView.module.css'

// Component that renders a list of requirement results
export function ResultListView({ items }) {
    return (
        <div className={styles.listContainer}>
            {items.map((item) => (
                <ResultItemView key={item.code} item={item} />
            ))}
        </div>
    )
}
