import React from 'react'
import { ResultItemView } from '@presentation/components/results/ResultItemView'
import styles from '@presentation/components/results/ResultListView.module.css'

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
