﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions; 

namespace UndirectedGraphEntity
{
    public class GraphContext : DbContext
    {
        public DbSet<GraphNode> GraphNode { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GraphNode>()
                .HasMany(p => p.AdjacentNodes)
                .WithMany()
                .Map(m =>
                {
                    m.MapLeftKey("ID");
                    m.MapRightKey("RelatedID");
                    m.ToTable("AdjacentNodes");
                });

        }
    }
}
